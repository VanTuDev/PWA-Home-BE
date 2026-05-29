import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { createPaymentUrl, verifyReturn, verifySignature } from '../services/vnpayService.js';
import { broadcastNewOrder } from '../services/socketService.js';

const FE_BASE = process.env.FE_URL || 'http://localhost:3000';

// @desc  POST /api/orders  — authenticated user
export const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod, note } = req.body;
    const userId = req.user._id;

    if (!items?.length || !shippingInfo?.name || !shippingInfo?.phone || !shippingInfo?.address) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đơn hàng và địa chỉ giao hàng.' });
    }

    // Resolve products & calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ message: `Sản phẩm không tồn tại.` });
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

    const order = await Order.create({
      userId,
      items:        orderItems,
      shippingInfo,
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      discount,
      total,
      note: note || '',
      vnpayTxnRef: ''
    });

    // Notify admin via socket
    broadcastNewOrder({
      orderId:     order._id,
      customerName: shippingInfo.name,
      total,
      paymentMethod
    });

    if (paymentMethod === 'online') {
      const ipAddr   = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
      const orderInfo = `PAW Shop don hang ${order._id.toString().slice(-6)}`;
      const paymentUrl = createPaymentUrl(order._id.toString(), total, orderInfo, ipAddr);

      if (!paymentUrl) {
        // VNPay chưa config → trả COD fallback
        return res.status(201).json({
          order,
          warning: 'VNPay chưa được cấu hình. Đơn hàng tạm thời được đặt theo hình thức COD.',
          paymentUrl: null
        });
      }

      order.vnpayTxnRef = order._id.toString();
      await order.save();

      return res.status(201).json({ order, paymentUrl });
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
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng.' });
  }
};

// @desc  GET /api/orders/vnpay_ipn  — VNPay server-to-server IPN (ưu tiên hơn return URL)
export const vnpayIpn = async (req, res) => {
  try {
    const result = verifySignature(req.query);

    // Chữ ký không hợp lệ
    if (!result.isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid Signature' });
    }

    const order = await Order.findById(result.txnRef);

    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // Đơn đã xử lý trước đó
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    // Kiểm tra số tiền (VNPay trả về amount * 100)
    const vnpAmount = parseInt(req.query.vnp_Amount || '0') / 100;
    if (Math.abs(vnpAmount - order.total) > 1) {
      return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (result.responseCode === '00') {
      order.paymentStatus    = 'paid';
      order.orderStatus      = 'confirmed';
      order.vnpayTransactionId = result.transactionId;
    } else {
      order.paymentStatus = 'failed';
    }

    await order.save();
    console.log(`[VNPay IPN] Order ${result.txnRef} → ${order.paymentStatus}`);

    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (error) {
    console.error('VNPay IPN error:', error.message);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// @desc  GET /api/orders/vnpay_return  — VNPay redirect customer về sau thanh toán
export const vnpayReturn = async (req, res) => {
  try {
    const result = verifyReturn(req.query);
    const orderId = result.txnRef;

    if (result.success && orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus    = 'paid';
        order.orderStatus      = 'confirmed';
        order.vnpayTransactionId = result.transactionId;
        await order.save();
      }
    }

    const status = result.success ? 'success' : 'failed';
    return res.redirect(`${FE_BASE}/payment/result?status=${status}&orderId=${orderId || ''}`);
  } catch (error) {
    console.error('VNPay return error:', error.message);
    return res.redirect(`${FE_BASE}/payment/result?status=error`);
  }
};
