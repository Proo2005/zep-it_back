import razorpay from "../lib/razorpay.js"

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees → paise
      currency: "INR",
      receipt: "receipt_order_1",
    })

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
