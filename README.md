# ImpactOS — CSR Governance & NGO Impact Intelligence

> A two-sided B2B CSR governance and impact intelligence platform connecting corporate capital oversight with on-ground NGO operations and offline-first field data collection.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&style=flat-square)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-stone?style=flat-square)](#)

---

## 🏛️ The Two-Sided Platform Architecture

ImpactOS solves the systemic disconnect between corporate CSR leadership allocating multi-crore budgets and grassroots NGO field teams collecting beneficiary telemetry. It unifies corporate fiduciary oversight, NGO operational execution, and field data collection into one reactive, audit-locked loop.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ImpactOS Architecture                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                 1. Funder Console (Bajaj CSR)                 │    │
│   │    Corpus Deployment · Milestone Tranches · SROI Analytics    │    │
│   └───────────────────────────────▲───────────────────────────────┘    │
│                                   │ Live Reactive Store                │
│                                   │ (Canonical State)                  │
│   ┌───────────────────────────────┴───────────────────────────────┐    │
│   │                2. NGO Operations ERP (Pratham)                │    │
│   │    Batch Attendance · Beneficiary 360° · QA Quarantine Queue   │    │
│   └───────────────────────────────▲───────────────────────────────┘    │
│                                   │ Auto-Sync / Audit Telemetry        │
│   ┌───────────────────────────────┴───────────────────────────────┐    │
│   │              3. Field Officer Mobile App (Offline)            │    │
│   │     GPS Geofence · Triangulated M6 Surveys · Multilingual     │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧭 Core Perspectives (3-Role System)

### 1. Funder Console (CSR Leadership)
- **Portfolio Overview & Tranche Sign-offs:** Real-time visibility into the ₹42.0 Cr CSR corpus (₹38.4 Cr deployed across 6 NGO partners in Maharashtra, Madhya Pradesh, and Tamil Nadu; 42,850 women enrolled). Directly approve tranche releases or place audit holds on underperforming partners.
- **Multi-Programme Outcome Analytics:** Dynamic toggling between **Micro-Skilling: Women Entrepreneurs** (28,400 women across 4 NGOs) and **Foundational Women's Literacy** (14,450 women across 2 NGOs). Tracks median income trajectories, enterprise survival rates, digital adoption, and FLN Level 3 grade-level fluency.
- **1:1 NGO Partner Benchmarking:** Head-to-head conversion funnels (`Stage 1 Enrolled → Stage 2 Completed → Stage 3 Enterprise Started → Stage 4 Earning 1-Yr`), SROI efficiency comparisons, and ground-truth audit verification matrices.
- **Next-Cycle Capital Allocation Simulator:** Model budget rebalancing across implementing partners under fixed statutory caps to maximize cohort graduation and portfolio SROI.
- **Regional Equity (`Geographies`):** District-level saturation index tracking metro, tier-2, and rural clusters across Pune, Nashik, Thane, Jabalpur, Bhopal, and Madurai.
- **Forensic Audit Docket & Governance (`Operations & Audits`):** Live CA-audited Utilization Certificate (UC) verification, GPS anomaly detection, and statutory compliance dockets.

### 2. NGO Operations ERP (Implementing Partner Console)
- **Operations & Batch Attendance:** Cohort tracking across active batches with session completion ratios and assessment metrics.
- **Beneficiary 360° Ledger:** Full demographic, asset, livestock, and longitudinal intake-to-endline tracking per beneficiary.
- **Survey QA Quarantine & Sync Queue:** Quality gate enabling NGO team leads to inspect, flag anomalies, verify GPS coordinates, and approve field-collected surveys before publishing directly to the funder dashboard.

### 3. Field Officer Mobile App (Ground-Truth Telemetry)
- **Offline-First Resilience:** Local queue architecture that records attendance and surveys offline, syncing automatically when connectivity resumes.
- **GPS-Verified Attendance:** Prevents phantom attendance by verifying coordinates against municipal cluster boundaries.
- **Triangulated 7-Day Net-Profit M6 Surveys:** Replaces self-reported income guessing with triangulated math (`Good Day Revenue`, `Slow Day Revenue`, `Weekly Working Days`, `Weekly Input Costs`, and `UPI receipts proof`) with automated anti-fraud anomaly flags.
- **Adaptive Ergonomics:** Native full-bleed layout on mobile phones with sticky bottom navigation and an interactive hardware simulator on desktop.
- **Multilingual Support:** One-tap toggle between **English**, **हिंदी (Hindi)**, and **मराठी (Marathi)**.

---

## ⚡ Engineering Highlights

- **Single Canonical Reactive Store (`src/data/impactStore.tsx`):** Every KPI, chart, table, drawer, and ledger across all 3 perspectives derives dynamically from a single reactive React context with local persistence. Actions in the Field App or ERP update the Funder Console instantaneously.
- **Warm Khadi & Bajaj Heritage Blue Design System:** Built on institutional warm archival paper tones (`#F6F3EC` canvas, `#FCFBF8` surface) paired with Bajaj Heritage Blue (`#0B4A7D`), Impact Botanical Moss (`#2E6B4E`), Mineral Terracotta (`#B5532A`), and Caution Ochre (`#A86414`).
- **Snappy, Tactile Micro-Interactions:** Fast, critically damped spring transitions (`120ms`–`280ms`), shared `layoutId` gliding pills, rolling tabular counters, and Vaul-style responsive bottom sheets.
- **100% Responsive Architecture:** Fluid from `360px` mobile screens up to `1440px+` ultra-wide monitors with zero horizontal overflow, safe-area padding (`env(safe-area-inset-bottom)`), and responsive table-to-card transformations.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with centralized CSS custom property tokens
- **Data Visualizations:** [Recharts](https://recharts.org/) (responsive area pace charts, paired conversion funnels, efficiency scatter plots)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/) (Single-Page Application rewrite configured via `vercel.json`)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js `18.x` or higher
- npm `9.x` or higher

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/rameshtavishwakarma97-design/ngo-impact-intelligence.git
cd ngo-impact-intelligence

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be live at `http://localhost:5173`.

### Production Build & Type Check

```bash
# Run strict TypeScript check and Vite production bundle build
npm run build
```

The production assets will be output to `dist/`.

---

## ☁️ Deploy to Vercel

ImpactOS is pre-configured for zero-configuration, single-click deployment on Vercel:

1. **Import Repository:** Log into [Vercel](https://vercel.com) and click **"Add New Project"** → select **`ngo-impact-intelligence`**.
2. **Framework & Build Settings:**
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Deploy:** Click **Deploy**. SPA routing and deep links are already handled via the root [`vercel.json`](./vercel.json):
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 📄 License & Attribution

ImpactOS is developed as an institutional CSR Governance & Impact Intelligence platform.  
Copyright © 2025–2026. All rights reserved.
