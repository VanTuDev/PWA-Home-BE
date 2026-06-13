import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { createPaymentLink, verifyWebhook, isConfigured } from '../services/payosService.js';
import { broadcastNewOrder } from '../services/socketService.js';
import { createNotification } from './notificationController.js';

const FE_BASE = process.env.FE_URL || 'http://localhost:3000';
const BE_BASE = process.env.BE_URL || 'https://pwa-home-be.onrender.com';

// @desc  POST /api/orders  — authenticated user
export const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod, note } = req.body;
    const userId = req.user._id;

    if (!items?.length || !shippingInfo?.name || !shippingInfo?.phone || !shippingInfo?.address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đơn hàng và địa chỉ giao hàng.' });
    }

    const productIds = items.map(i => i.productId);
    const products   = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) return res.status(400).json({ message: 'Sản phẩm không tồn tại.' });
      if (product.stock < item.quantity) return res.status(400).json({ message: `${product.name} không đủ hàng tồn kho.` });

      orderItems.push({
        productId: product._id,
        name:      product.name,
        image:     product.image,
        price:     product.price,
        quantity:  item.quantity
      });
      subtotal += product.price * item.quantity;
    }

    const discount = paymentMethod === 'online' ? Math.round(subtotal * 0.1) : 0;
    const total    = subtotal - discount;

    // orderCode là số nguyên dùng cho PayOS — dùng timestamp để unique
    const payosOrderCode = Date.now();

    const order = await Order.create({
      userId,
      items:        orderItems,
      shippingInfo,
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      discount,
      total,
      note: note || '',
      payosOrderCode: paymentMethod === 'online' ? payosOrderCode : 0
    });

    broadcastNewOrder({ orderId: order._id, customerName: shippingInfo.name, total, paymentMethod });

    if (paymentMethod === 'online') {
      if (!isConfigured()) {
        return res.status(201).json({
          order,
          warning: 'PayOS chưa được cấu hình. Đơn hàng tạm thời được đặt theo hình thức COD.',
          paymentUrl: null
        });
      }

      const payosItems = orderItems.map(i => ({
        name:     i.name.slice(0, 50),
        quantity: i.quantity,
        price:    i.price
      }));

      const description = `PAW ${order._id.toString().slice(-8).toUpperCase()}`;
      const returnUrl   = `${BE_BASE}/api/orders/payos_return`;
      const cancelUrl   = `${FE_BASE}/payment/result?status=cancelled&orderId=${order._id}`;

      const payosData = await createPaymentLink({
        orderCode:   payosOrderCode,
        amount:      total,
        description,
        items:       payosItems,
        returnUrl,
        cancelUrl
      });

      return res.status(201).json({ order, paymentUrl: payosData.checkoutUrl });
    }

    return res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error.message);
    return res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.' });
  }
};

// @desc  GET /api/orders  — admin sees all, user sees own
export const getOrders = async (req, res) => {
  try {
    const isStaff = ['admin', 'manager', 'staff'].includes(req.user.role);
    const filter  = isStaff ? {} : { userId: req.user._id };

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi tải đơn hàng.' });
  }
};

// @desc  PUT /api/orders/:id/status  — admin/manager/staff
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });

    order.orderStatus = orderStatus;
    await order.save();

    // Notify user
    if (order.userId) {
      const statusMap = {
        Confirmed:  { title: '✅ Đơn hàng đã được xác nhận', body: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} của bạn đã được xác nhận và đang chuẩn bị.` },
        Shipping:   { title: '🚚 Đơn hàng đang được giao', body: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đang trên đường đến bạn!` },
        Delivered:  { title: '🎁 Đơn hàng đã giao thành công', body: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã được giao. Cảm ơn bạn đã mua hàng!` },
        Cancelled:  { title: '❌ Đơn hàng bị huỷ', body: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã bị huỷ.` },
      };
      const notif = statusMap[orderStatus];
      if (notif) {
        await createNotification({ userId: order.userId, type: 'order', title: notif.title, body: notif.body, link: '/history' });
      }
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng.' });
  }
};

// @desc  POST /api/orders/payos_webhook  — PayOS server-to-server webhook
export const payosWebhook = async (req, res) => {
  try {
    // verifyWebhook throws nếu chữ ký không hợp lệ
    const webhookData = await verifyWebhook(req.body);
    const { orderCode, code } = webhookData;
    const order = await Order.findOne({ payosOrderCode: orderCode });

    if (!order) {
      return res.status(200).json({ success: true }); // ack để PayOS không retry
    }

    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ success: true });
    }

    if (code === '00') {
      order.paymentStatus      = 'paid';
      order.orderStatus        = 'confirmed';
      order.payosTransactionId = webhookData.reference || '';
    } else {
      order.paymentStatus = 'failed';
    }

    await order.save();
    console.log(`[PayOS Webhook] orderCode=${orderCode} → ${order.paymentStatus}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('PayOS webhook error:', error.message);
    return res.status(200).json({ success: true }); // luôn ack để tránh retry loop
  }
};

// @desc  GET /api/orders/payos_return  — PayOS redirect khách hàng sau thanh toán
export const payosReturn = async (req, res) => {
  try {
    // PayOS trả về: code, id, cancel, status, orderCode
    const { code, status, orderCode, cancel } = req.query;

    const isCancelled = cancel === 'true' || status === 'CANCELLED';
    const isPaid      = code === '00' && status === 'PAID';

    if (orderCode) {
      const order = await Order.findOne({ payosOrderCode: Number(orderCode) });
      if (order && order.paymentStatus !== 'paid') {
        if (isPaid) {
          order.paymentStatus = 'paid';
          order.orderStatus   = 'confirmed';
        } else {
          order.paymentStatus = 'failed';
        }
        await order.save();
      }

      const resultStatus = isPaid ? 'success' : isCancelled ? 'cancelled' : 'failed';
      const orderId      = order?._id?.toString() || '';
      return res.redirect(`${FE_BASE}/payment/result?status=${resultStatus}&orderId=${orderId}`);
    }

    return res.redirect(`${FE_BASE}/payment/result?status=error`);
  } catch (error) {
    console.error('PayOS return error:', error.message);
    return res.redirect(`${FE_BASE}/payment/result?status=error`);
  }
};
