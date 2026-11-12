# 🍛 The Fooder - Andhra Food Restaurant

> **"Real Andhra flavour, from Vijayawada to your table."**

A modern full-stack web application with responsive UI, interactive multi-city branch finder, menu ordering, table reservations, live 4-step order tracking, and **Google Firebase Firestore** cloud database integration.

Works seamlessly on **GitHub Pages**, **Vercel**, or any static/cloud hosting.

---

## 🌟 Key Features

1. **📍 Multi-City Branch Finder & Selector**:
   - Covers all 6 branches: Vijayawada, Guntur, Eluru, Machilipatnam, Tenali, and Hyderabad with dynamic timings and delivery estimates.
2. **🍲 Handcrafted Andhra Menu**:
   - Categorized (Meals, Curries, Biryani, Tiffins, Sweets) with authentic recipes, descriptions, and Indian Veg/Non-Veg indicators.
3. **🎁 Automated Perks**:
   - Automatic free **Bobbatlu** on orders above ₹500 with real-time progress bar.
4. **🛒 Cart & Simulated UPI QR Checkout**:
   - Supports Cash on Delivery and Online UPI payments.
5. **⚡ Live 4-Step Order Tracker**:
   - Order received ➔ Cooking ➔ Out for delivery ➔ Delivered.
6. **📅 Table Reservation Pass Generator**:
   - Generates branded booking passes (`TB-xxxx`) with instant confirmation status.
7. **🔥 Google Firebase Firestore Integration**:
   - Real-time cloud sync for Orders, Table Bookings, and Reviews with zero server code required.

---

## 🔥 How to Connect Your Firebase Firestore Database

1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Add project** (e.g. name it `the-fooder`).
3. Click **Build** ➔ **Firestore Database** ➔ click **Create database** ➔ select **Start in test mode**.
4. In Project Overview, click the **Web icon (`</>`)** to register a web app.
5. Copy the `firebaseConfig` keys and paste them into [`js/firebase-config.js`](js/firebase-config.js).
6. That's it! All orders, bookings, and reviews will now sync live to your Firebase Firestore cloud database!

---

## 🚀 How to Run Locally

```bash
npm start
# or
node server.js
```
Open **`http://localhost:3000`** in your browser.
