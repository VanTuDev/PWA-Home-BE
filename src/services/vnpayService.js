import crypto from 'crypto';

const VNPAY_URL   = process.env.VNPAY_URL        || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const TMN_CODE    = process.env.VNPAY_TMN_CODE   || '';
const HASH_SECRET = process.env.VNPAY_HASH_SECRET || '';
const RETURN_URL  = process.env.VNPAY_RETURN_URL  || 'http://localhost:5000/api/orders/vnpay_return';

const pad = n => String(n).padStart(2, '0');

// Sort object keys alphabetically — bắt buộc theo spec VNPay
const sortObject = obj => {
  const sorted = {};
  Object.keys(obj).sort().forEach(k => { sorted[k] = obj[k]; });
  return sorted;
};

/**
 * Build chuỗi ký: KHÔNG encode — raw key=value&key=value
 * (VNPay spec: "các tham số sắp xếp alphabet, kết hợp bằng dấu &", không nói encode)
 */
const buildSignData = (sortedParams) =>
  Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

/**
 * Build query string cho URL: encode từng value bằng encodeURIComponent
 */
const buildQueryString = (sortedParams) =>
  Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

const sign = (data) =>
  crypto.createHmac('sha512', HASH_SECRET)
    .update(Buffer.from(data, 'utf-8'))
    .digest('hex');

// ─── Tạo payment URL ─────────────────────────────────────────────────────────

export const createPaymentUrl = (orderId, amount, orderInfo, ipAddr) => {
  if (!TMN_CODE || !HASH_SECRET) {
    console.warn('[VNPay] Chưa cấu hình VNPAY_TMN_CODE / VNPAY_HASH_SECRET trong .env');
    return null;
  }

  const now = new Date();
  const createDate = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('');

  // Làm sạch orderInfo — chỉ giữ chữ/số/khoảng trắng
  const cleanInfo = orderInfo.replace(/[^\w\s]/g, '').trim().substring(0, 255);

  const params = {
    vnp_Amount:     String(Math.round(amount * 100)),   // VNPay nhận đơn vị đồng x100
    vnp_Command:    'pay',
    vnp_CreateDate: createDate,
    vnp_CurrCode:   'VND',
    vnp_IpAddr:     (ipAddr || '127.0.0.1').split(',')[0].trim(),
    vnp_Locale:     'vn',
    vnp_OrderInfo:  cleanInfo || `PAW Shop ${orderId.slice(-6)}`,
    vnp_OrderType:  'other',
    vnp_ReturnUrl:  RETURN_URL,
    vnp_TmnCode:    TMN_CODE,
    vnp_TxnRef:     orderId,
    vnp_Version:    '2.1.0',
  };

  const sorted   = sortObject(params);
  const signData = buildSignData(sorted);
  const secureHash = sign(signData);

  console.log('[VNPay] signData:', signData);
  console.log('[VNPay] secureHash:', secureHash);

  return `${VNPAY_URL}?${buildQueryString(sorted)}&vnp_SecureHash=${secureHash}`;
};

// ─── Xác thực chữ ký callback (dùng chung cho return & IPN) ─────────────────

export const verifySignature = (query) => {
  const secureHash = query.vnp_SecureHash;

  // Loại bỏ 2 trường hash khỏi tập params trước khi tính lại
  const params = Object.fromEntries(
    Object.entries(query).filter(
      ([k]) => k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType'
    )
  );

  const sorted   = sortObject(params);
  const signData = buildSignData(sorted);
  const computed = sign(signData);

  console.log('[VNPay] verify signData:', signData);
  console.log('[VNPay] computed hash: ', computed);
  console.log('[VNPay] received hash: ', secureHash);

  return {
    isValid:       computed === secureHash,
    responseCode:  query.vnp_ResponseCode,
    txnRef:        query.vnp_TxnRef,
    transactionId: query.vnp_TransactionNo,
    amount:        parseInt(query.vnp_Amount || '0') / 100,
    success:       computed === secureHash && query.vnp_ResponseCode === '00'
  };
};

// Alias để không phải đổi tên ở controller
export const verifyReturn = verifySignature;
