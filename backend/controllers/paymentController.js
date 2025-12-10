const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const Order = require('../models/Order');

// --- HÀM PHỤ TRỢ SẮP XẾP ---
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// 1. TẠO URL THANH TOÁN VNPAY
// POST /api/payment/create_payment_url
exports.createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection.socket && req.connection.socket.remoteAddress);

    const tmnCode   = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    let   vnpUrl    = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const { orderCode, language, bankCode } = req.body;

    if (!orderCode) {
      return res.status(400).json({ msg: 'Thiếu orderCode' });
    }

    const order = await Order.findOne({ 
      orderCode,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
    }

    const amount = order.total;

    let vnp_Params = {};
    vnp_Params['vnp_Version']   = '2.1.0';
    vnp_Params['vnp_Command']   = 'pay';
    vnp_Params['vnp_TmnCode']   = tmnCode;
    vnp_Params['vnp_Locale']    = language || 'vn';
    vnp_Params['vnp_CurrCode']  = 'VND';
    vnp_Params['vnp_TxnRef']    = order.orderCode;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${order.orderCode}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount']    = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr']    = ipAddr;
    vnp_Params['vnp_CreateDate']= createDate;
    
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl: vnpUrl });
  } catch (err) {
    console.error('Lỗi createPaymentUrl:', err);
    res.status(500).json({ msg: 'Lỗi server createPaymentUrl' });
  }
};

// 2. IPN: VNPAY GỌI VỀ BACKEND THÔNG BÁO KẾT QUẢ THANH TOÁN
// GET /api/payment/vnpay_ipn
exports.vnpIpn = async (req, res) => {
  try {
    let vnp_Params = Object.assign({}, req.query);

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASH_SECRET;

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    // Kiểm tra checksum
    if (secureHash !== signed) {
      return res.status(400).json({ RspCode: '97', Message: 'Checksum failed' });
    }

    const rspCode  = vnp_Params['vnp_ResponseCode'];
    const orderCode = vnp_Params['vnp_TxnRef'];

    // Tìm order theo orderCode
    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ RspCode: '01', Message: 'Order not found' });
    }

    // Nếu đã xử lý paid rồi thì trả OK luôn để VNPAY khỏi gọi lại
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ RspCode: '00', Message: 'Order already paid' });
    }

    if (rspCode === '00') {
      // THANH TOÁN THÀNH CÔNG
      order.isPaid = true;
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.paidAt = new Date();
      await order.save();

      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
      // THANH TOÁN THẤT BẠI / BỊ HUỶ
      order.isPaid = false;
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(200).json({ RspCode: '00', Message: 'Transaction failed' });
    }

  } catch (err) {
    console.error('Lỗi vnpIpn:', err);
    return res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// 3. USER QUAY LẠI TỪ TRANG VNPAY
// GET /api/payment/vnpay_return
exports.vnpReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/order-success?status=fail&reason=checksum`
      );
    }

    const rspCode   = vnp_Params['vnp_ResponseCode'];
    const orderCode = vnp_Params['vnp_TxnRef']; 

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/order-success?status=fail&reason=notfound`
      );
    }

    if (order.paymentStatus === 'paid' || order.isPaid) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/order-success?status=success&orderCode=${order.orderCode}`
      );
    }

    if (rspCode === '00') {
      // THANH TOÁN THÀNH CÔNG
      order.isPaid        = true;
      order.paymentStatus = 'paid';
      order.status        = 'processing';
      order.paidAt        = new Date();
      await order.save();

      return res.redirect(
        `${process.env.FRONTEND_URL}/order-success?status=success&orderCode=${order.orderCode}`
      );
    } else {
      // THANH TOÁN THẤT BẠI / HỦY
      order.isPaid        = false;
      order.paymentStatus = 'failed';
      await order.save();

      return res.redirect(
        `${process.env.FRONTEND_URL}/order-success?status=fail&orderCode=${order.orderCode}`
      );
    }
  } catch (err) {
    console.error('Lỗi vnpReturn:', err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/order-success?status=fail&reason=server`
    );
  }
};