# Smart Canteen — Pre-Ordering System

## Team

| | |
| --- | --- |
| **Team name** | Smart Canteen Pre-Ordering Team |
| **Members** | 1. Renuka Sonawane · 2. Priya Rangade |

## Project title

**Smart Canteen — Pre-Ordering System**

## Brief description

Smart Canteen is a web application for **campus / canteen pre-ordering**. Customers can create an account or sign in, browse a categorized menu (search, filters, favorites), manage a cart with quantities, choose a payment method, and place orders with confirmation. An **admin dashboard** (default demo login) shows order pipeline stats, per-order status (Pending → Preparing → Ready → Served), expandable line items, and the live menu catalog. Orders and user data can be persisted locally in the browser for demos and hackathon evaluation.

## Repository

**Public GitHub:** [https://github.com/priyarangade47/Smart-canteen-pre-ordering-system.git](https://github.com/priyarangade47/Smart-canteen-pre-ordering-system.git)

Clone:

```bash
git clone https://github.com/priyarangade47/Smart-canteen-pre-ordering-system.git
cd Smart-canteen-pre-ordering-system
```

## Tech stack

- **Frontend:** React (Create React App), CSS
- **Backend (in repo):** Node.js, Express, Mongoose (optional API layer)
- **Persistence (demo):** `localStorage` for cart, orders, users, theme

## How to run (frontend)

From the project root:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000** (default CRA port).

### Optional — API server (root)

```bash
npm install
npm start
```

Requires a configured MongoDB connection if you use the API routes under `config/`.

---

## Hackathon submission checklist

> **Subject:** 🚀 Action Required: GitHub Repository & Submission Guidelines  

- **Repository:** Public GitHub repo created and linked to your team on the submission platform.  
- **README:** Includes team name, project title, short solution description (this file).  
- **Commits:** Commit regularly to show progress during the event.  
- **Team on platform:** All members added so everyone receives credit.  
- **Submission deadline:** **14 May 2026** — submit and push early (e.g. at least **30 minutes** before close) to avoid last-minute issues.

If anything blocks submission (platform, GitHub, or build errors), contact the organizing team as soon as possible.

---

**Best of luck with the hackathon.**

— Smart Canteen Pre-Ordering Team
