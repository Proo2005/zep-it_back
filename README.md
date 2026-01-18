# BlinkIt Backend

This is the backend for the **BlinkIt** quick-commerce app. Built with **Node.js**, **Express**, **MongoDB**, and **Mongoose**, it handles user authentication, item management, payment processing, order/payment history, and shop analytics.

---

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schemas](#database-schemas)
- [API Routes](#api-routes)
- [Technologies Used](#technologies-used)
- [Notes](#notes)

---

## Installation

1. Clone the repository:

```bash
git clone <repo_url>
cd blinkit/back
```

2. Install Dependencies

```bash
npm install
```

3. Create a .env file in the root:

```bash
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=5000
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
```

4. Start the Server:

```bash
npm run dev
# or
nodemon server.js
```

## Database Schemas

1. User
```bash
{
  name: String,          // required
  email: String,         // required, unique
  phone: String,         // optional
  type: String,          // "customer" or "shop"
  password: String,      // hashed
  timestamps: true
}
```

2. Item
```bash
{
  itemName: String,      // required
  price: Number,         // required
  quantity: Number,      // stock available
  description: String,
  shopId: ObjectId,      // reference to User
  timestamps: true
}
```

3. Payment
```bash
{
  userName: String,      // required
  email: String,         // required
  paymentMethod: String, // "UPI" or "Card"
  upiNumber: String,     // optional, for UPI
  upiId: String,         // optional, for UPI
  cardNumber: String,    // optional, for Card
  cvv: String,           // optional, for Card
  expiry: String,        // optional, for Card
  amount: Number,        // required
  timestamps: true
}
```

4. Payment History
```bash
{
  userId: ObjectId,      // reference to User
  userName: String,
  email: String,
  items: [
    {
      itemId: ObjectId,  // reference to Item
      name: String,
      quantity: Number,
      amount: Number
    }
  ],
  totalAmount: Number,
  paymentMethod: String, // "UPI" or "Card"
  createdAt: Date
}
```

## API Routes
```bash
Auth Routes

POST /api/auth/signup – Register new user

POST /api/auth/login – Login existing user

User Routes

GET /api/user/me – Get logged-in user details

Item Routes

GET /api/item/ – Get all items

POST /api/item/ – Add new item (shop only)

PATCH /api/item/:id – Update item

DELETE /api/item/:id – Delete item

Payment Routes

POST /api/payment/ – Process payment and update inventory

GET /api/payment/history – Get logged-in user payment history

POST /api/payment/history – Save payment details for user

Shop Analysis Routes

GET /api/shop-analysis – Get total sales, items sold, weekly/monthly revenue, payment split (shop only)

```