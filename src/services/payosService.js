import { PayOS } from '@payos/node';

let _payos = null;

const getPayOS = () => {
  if (!_payos) {
    _payos = new PayOS({
      clientId:    process.env.PAYOS_CLIENT_ID,
      apiKey:      process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    });
  }
  return _payos;
};

export const isConfigured = () =>
  !!(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY);

/**
 * Tạo payment link PayOS
 * @param {number} orderCode  - Unique integer (dùng Date.now())
 * @param {number} amount     - Tổng tiền VND
 * @param {string} description - Tối đa 25 ký tự
 * @param {Array}  items      - [{ name, quantity, price }]
 * @param {string} returnUrl  - Redirect sau thanh toán
 * @param {string} cancelUrl  - Redirect khi huỷ
 * @returns {Promise<{ checkoutUrl, paymentLinkId }>}
 */
export const createPaymentLink = async ({ orderCode, amount, description, items, returnUrl, cancelUrl }) => {
  const payos = getPayOS();
  return payos.paymentRequests.create({
    orderCode,
    amount,
    description: description.slice(0, 25),
    items,
    returnUrl,
    cancelUrl,
    expiredAt: Math.floor(Date.now() / 1000) + 15 * 60,
  });
};

/**
 * Xác minh dữ liệu webhook từ PayOS
 * @param {{ data: object, signature: string }} webhookBody
 * @returns {Promise<object>} webhookData đã được xác minh
 */
export const verifyWebhook = (webhookBody) => {
  const payos = getPayOS();
  return payos.webhooks.verify(webhookBody);
};

/**
 * Lấy thông tin payment link theo orderCode
 */
export const getPaymentLinkInfo = (orderCode) => {
  const payos = getPayOS();
  return payos.paymentRequests.get(String(orderCode));
};
