# 🍛 The Fooder - Andhra Food Restaurant

> **"Real Andhra flavour, from Vijayawada to your table."**

A modern full-stack web application with responsive UI, interactive multi-city branch finder, menu ordering, table reservations, live 4-step order tracking, and **MongoDB Atlas** database integration deployed on **Vercel** with **GitHub Actions CI/CD**.

---

## 🏗️ Architecture

```
                                      ┌────────────────────────────────┐
                                      │         Vercel Cloud           │
                                      │                                │
[ Client Browser ] ─── HTTPS ───────► │ ├── Static Frontend (SPA)     │
       ▲                              │ │   ├── index.html             │
       │                              │ │   ├── css/styles.css         │
       │                              │ │   └── js/app.js & data.js    │
       │                              │ │                              │
       └─────── REST API Calls ─────► │ └── Serverless API (/api/*)   │
                                      │     ├── orders.js              │
                                      │     ├── bookings.js            │
                                      │     └── reviews.js             │
                                      └──────────────┬─────────────────┘
                                                     │ Mongoose / Native Driver
                                                     ▼
                                      ┌────────────────────────────────┐
                                      │      MongoDB Atlas Cloud       │
                                      │                                │
                                      │  Collections:                  │
                                      │  ├── orders                    │
                                      │  ├── bookings                  │
                                      │  └── reviews                   │
                                      └────────────────────────────────┘
```

---

## 🚀 Step-by-Step Deployment Guide

### 1️⃣ Set up MongoDB Atlas (Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in (or create a free account).
2. Click **Create a Deployment** and choose the **M0 Free Tier** cluster (e.g. AWS / Mumbai or any region).
3. Under **Security Quickstart**:
   - **Database User**: Create a username (e.g. `fooder_admin`) and a secure password. **Note down this password!**
   - **Network Access**: Add IP Access List entry: Set to `0.0.0.0/0` (Allow Access from Anywhere) so Vercel's dynamic serverless IPs can connect.
4. Click **Connect** ➔ choose **Drivers (Node.js)**.
5. Copy your connection string. It looks like:
   ```env
   mongodb+srv://fooder_admin:<password>@cluster0.abcde.mongodb.net/thefooder?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password and specify `/thefooder` as the database name).*

---

### 2️⃣ Push Code to GitHub

Open your terminal in this project folder (`foodfinder`) and run:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: The Fooder app with Vercel and MongoDB Atlas"

# 4. Rename main branch
git branch -M main

# 5. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/the-fooder.git

# 6. Push to GitHub
git push -u origin main
```

---

### 3️⃣ Deploy to Vercel (Automatic Method)

1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** ➔ **Project**.
3. Select your GitHub repository (`the-fooder`) and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset**: Other (Static / Node)
   - Expand **Environment Variables**:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://fooder_admin:<password>@cluster0.abcde.mongodb.net/thefooder?retryWrites=true&w=majority`
     - Key: `MONGODB_DB`
     - Value: `thefooder`
5. Click **Deploy**! 🚀
6. Vercel will build your project, deploy the static frontend, and host the serverless functions in `/api/`. Your live site URL will be:
   `https://the-fooder.vercel.app` (or similar).

---

### 4️⃣ Set up the GitHub Actions CI/CD Workflow

Your repository already includes the automated workflow file at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Every time you push code to `main` or `master`, GitHub Actions will automatically validate the syntax and deploy to Vercel.

To connect GitHub Actions to your Vercel project:

1. Obtain your **Vercel Token**:
   - Go to **Vercel Account Settings** ➔ **Tokens** ➔ Create a token (e.g. `GITHUB_ACTIONS_TOKEN`) and copy it.
2. Obtain your **Vercel Org ID & Project ID**:
   - In your local terminal, install Vercel CLI and link:
     ```bash
     npx vercel link
     ```
   - This creates `.vercel/project.json` containing `orgId` and `projectId`.
3. Add Secrets to GitHub:
   - Go to your GitHub repository ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**.
   - Click **New repository secret** and add:
     - `VERCEL_TOKEN`: *(Your Vercel personal access token)*
     - `VERCEL_ORG_ID`: *(Your Vercel Organization ID)*
     - `VERCEL_PROJECT_ID`: *(Your Vercel Project ID)*

Now, any `git push origin main` triggers continuous deployment!

---

## 🧪 Local Testing

To test the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the local server
npm start
# or
node server.js
```
Open **`http://localhost:3000`** in your browser.

---

## 📁 Repository Structure

```
foodfinder/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD pipeline
├── api/                      # Vercel Serverless Functions
│   ├── db.js                 # MongoDB Atlas connection pooling
│   ├── orders.js             # Order placement & tracking API
│   ├── bookings.js           # Table reservation API
│   └── reviews.js            # Guest review submission API
├── css/
│   └── styles.css            # Authentic Andhra design system
├── js/
│   ├── data.js               # 6 branches & complete menu dataset
│   └── app.js                # Frontend state, cart & API sync
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions
├── index.html                # Main single-page web app
├── package.json              # NPM metadata & dependencies
├── server.js                 # Local static HTTP server
├── vercel.json               # Vercel routing & serverless config
└── README.md                 # Complete documentation
```
