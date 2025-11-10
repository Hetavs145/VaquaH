import Razorpay from 'razorpay';
import crypto from 'crypto';

// POST /api/payments/razorpay/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body || {};

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Send amount in paise as a positive integer.' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount, // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return res.status(200).json(order);
  } catch (err) {
    const detail = err?.error?.description || err?.message || 'Unknown error';
    // Log full error for debugging
    // eslint-disable-next-line no-console
    console.error('Razorpay create order error:', err?.error || err);
    return res.status(500).json({ message: 'Failed to create Razorpay order', error: detail });
  }
};

// POST /api/payments/razorpay/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ valid: false, message: 'Missing verification fields' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({ valid: true });
    }
    return res.status(400).json({ valid: false, message: 'Invalid signature' });
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Verification error', error: err?.message });
  }
};


