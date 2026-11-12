# 🍛 The Fooder - Andhra Food Restaurant

> **"Real Andhra flavour, from Vijayawada to your table."**

A modern full-stack web application with responsive UI, multi-city branch finder, menu ordering, table reservations, live 4-step order tracking, and **Supabase Cloud PostgreSQL** database integration.

Works seamlessly on **GitHub Pages**, **Vercel**, or local hosting.

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
7. **👤 Customer Profile & Cloud Credentials**:
   - Customer profile modal to save credentials (name, phone, address) for one-click checkout and reservations.
   - Built-in Supabase Cloud configuration UI tab to enter your `anon` key directly from the browser with live connection status.
8. **⚡ Supabase PostgreSQL Integration**:
   - Direct real-time cloud database for Orders, Table Reservations, and Reviews with automatic offline fallback.

---

## ⚡ How to Connect Supabase (In 3 Minutes)

1. Go to **[supabase.com](https://supabase.com/)** and click **Start your project** (Sign in with your GitHub account in 1 click).
2. Click **New project**, name it `the-fooder`, and enter a database password.
3. In your Supabase Dashboard:
   - Go to **Project Settings** (gear icon) ➔ **API**.
   - Copy your **Project URL** and **Project API Key (anon / public)**.
4. Paste them into [`js/supabase-config.js`](js/supabase-config.js).
5. In Supabase, go to **SQL Editor** ➔ click **New query** ➔ paste the contents of [`supabase_setup.sql`](supabase_setup.sql) ➔ click **Run**.

Done! All orders, bookings, and reviews will now sync directly to your Supabase PostgreSQL database.

---

## 🚀 How to Run Locally

```bash
npm start
# or
node server.js
```
Open **`http://localhost:3000`** in your browser.
