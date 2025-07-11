import Razorpay from "razorpay";
import Payment from "../models/payment.js";
import Subscription from "../models/subscription.js";
const razorpay = new Razorpay({
  key_id: "rzp_test_l8kTJWUfz1w9pU",
  key_secret: "le3zd6mAvDTnugwU2dcto3Vb",
});

const createOrder = async (req, res) => {
  const options = {
    amount: 30000,
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const verifyPaymentForSubscription = async (req, res) => {
  const { userId } = req.user;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log(req.body);
  const { order_id, payment_id, signature } = req.body;
  try {
    const payment = await razorpay.payments.fetch(payment_id);
    const paymentDetails = await razorpay.payments.fetch(payment_id);
    if(paymentDetails.status !== "captured") return res.status(400).json({message:"Payment not captured"});
    const subscription = await Subscription.findOne({
      where: { user_id: String(userId) },
    });
    if (!subscription) {
      const subscription = await Subscription.create({
        user_id: String(userId),
        start_date: new Date(),
        end_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        payment_id: [payment_id],
      });
      const paymentRecord = await Payment.create({
        razorpay_payment_id: payment_id,
        subscription_id: subscription.subscription_id,
        user_id: userId,
        amount: paymentDetails.amount,
        role: "wholesaler",
        status: "successful",
        created_at: paymentDetails.created_at,
      });
      res.json({
        message: "Subscription successful",
        end_date: subscription.end_date,
      });
    } else {
      subscription.end_date = new Date(
        subscription.end_date.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      subscription.isCompleted = false;
      subscription.payment_id.push(payment_id);
      await subscription.save();
      const paymentRecord = await Payment.create({
        razorpay_payment_id: payment_id,
        subscription_id: subscription.subscription_id,
        user_id: userId,
        amount: paymentDetails.amount,
        role: "wholesaler",
        status: "successful",
        created_at: paymentDetails.created_at,
      });
      res.json({
        message: "Subscription successful",
        end_date: subscription.end_date,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getPaymentDetails = async (req, res) => {
  const { razorpay_payment_id } = req.body;
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log(payment);
    return res.json(payment);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
export default { createOrder, verifyPaymentForSubscription, getPaymentDetails };
