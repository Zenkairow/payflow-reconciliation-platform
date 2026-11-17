# PayFlow — Payment Reconciliation Platform

> **AI Native Product Manager Assessment for Onelab Ventures**  
> **Prepared for:** Onelab Ventures Evaluation Committee  
> **Live Web Application:** [https://zenkairow.github.io/payflow-reconciliation-platform/](https://zenkairow.github.io/payflow-reconciliation-platform/)  
> **Public GitHub Repository:** [https://github.com/Zenkairow/payflow-reconciliation-platform](https://github.com/Zenkairow/payflow-reconciliation-platform)

---

## 1. Executive Summary & Problem Overview

PayFlow is a professional browser-based fintech reconciliation platform built for a **Finance Operations Analyst**. It automatically compares core payment platform records against bank settlement statements, explains discrepancies in plain finance language, provides deep graphical analytics, and generates executive-grade audit packs powered by **Google Gemini LLM**.

### The Core Accounting Reconciliation Bridge
Our deterministic reconciliation engine traces the initial **+₹723.012** ledger variance down to the exact paise with **zero residual variance**:

$$\begin{aligned}
\text{Net Platform Captured Revenue} &\quad \mathbf{₹44,152.012} \\
-\; \text{Deduct Duplicate Capture (TXN030, MER007)} &\quad -₹1,500.000 \\
+\; \text{Add Unexpected Direct Bank Credit (BNKONLY001, MER009)} &\quad +₹777.000 \\
-\; \text{Adjust Sub-Paise Truncation Variance (TXN027–029, MER006)} &\quad -₹0.012 \\
\hline
= \; \mathbf{\text{Reconciled Bank Statement Settlement}} &\quad \mathbf{₹43,429.000} \\
\mathbf{\text{Unexplained Residual Accounting Variance}} &\quad \mathbf{₹0.000} \quad (\text{100\% Balanced})
\end{aligned}$$

---

## 2. Mandatory Assessment Scenarios Traceability (S1–S9)

Every required assessment scenario maps directly to underlying physical records:

| Scenario | Title | Records | Amount (INR) | Engine Classification & Accounting Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **S1** | **Next-Month Settlement** | `TXN026` / `BNK-TXN026` | ₹2,500.00 | **`TIMING_DIFFERENCE`**: Processed Jan 31; settled Feb 01. In-transit cross-period timing carryover. |
| **S2** | **Aggregate Rounding** | `TXN027`, `028`, `029` / `BNK-R027–029` | ₹30.012 vs ₹30.000 | **`ROUNDING_DIFFERENCE`**: Platform stores 3-decimal precision (`10.004` INR) vs bank 2-decimal truncation (`10.00` INR). Net variance: **+₹0.012**. |
| **S3** | **Duplicate Platform Capture** | `TXN030` (Rows 31 & 32) / `BNK-D030` | ₹3,000.00 (2 × 1500) vs ₹1,500.00 | **`DUPLICATE_IN_PLATFORM`**: Row 31 matched; duplicate Row 32 isolated and excluded from recognized net revenue. |
| **S4** | **Unmatched Orphan Refund** | `REF002` / `BNK-REF002` | ₹500.00 | **`UNMATCHED_REFUND`**: References nonexistent `TXN9999`. Disputed and merchant disbursements frozen. |
| **S5** | **Bank-Only Entry** | `BNKONLY001` / `BNK-EXTRA001` | ₹777.00 | **`UNEXPECTED_BANK_ENTRY`**: Direct bank settlement with no platform checkout order. |
| **S6** | **Standard 1-to-1 Matches** | `TXN001`–`TXN025`, `031`, `032`, `REF001` | ₹37,840.00 | **`MATCHED`**: 100% matched across platform and bank with zero variance. |
| **S7** | **Missing Bank Settlement** | Platform payment without bank credit | Positive | **`MISSING_SETTLEMENT`**: Accrual item requiring acquirer partner escalation. |
| **S8** | **Amount Mismatch** | Difference > tolerance threshold | Discrepant | **`AMOUNT_MISMATCH`**: Fee deduction or partial settlement dispute. |
| **S9** | **Attribute Mismatch** | Metadata conflict (Merchant/Currency) | N/A | **`ATTRIBUTE_MISMATCH`**: Metadata correction in transaction ledger. |

---

## 3. Key Application Features

1. **Overview Dashboard**:
   - Distinguishes **Raw Source Records** (35 Platform, 35 Bank) from **Unique Entities** (34 Platform, 35 Bank), **Matched Pairs** (32), and **Total Exceptions** (7).
   - Live Financial Position cards with one-click period filter (`All Records`, `January 2026`, `February 2026`).
2. **Transactions Explorer**:
   - Two separate tabs for Platform and Bank ledgers.
   - Multi-column search, type filter (`PAYMENT` / `REFUND`), merchant filter, status filter, and duplicate highlight checkbox.
   - Preserves raw string precision (e.g. `10.004` INR) alongside formatted figures.
3. **Reconciliation Engine**:
   - Deterministic multi-pass rule pipeline.
   - 100% idempotent: repeated runs yield consistent outputs with zero phantom duplicate exceptions.
4. **Exceptions Management**:
   - Dedicated triage table with plain-English root causes and recommended accounting actions.
   - Interactive status update (`OPEN`, `INVESTIGATING`, `RESOLVED`, `ADJUSTED`) with analyst audit notes.
   - **"Run Forensic AI Deep Dive"** button on every exception card.
5. **Financial Summary**:
   - Formal ledger accounting measures distinguishing raw source totals from adjusted valid-match totals.
   - 4-point accounting disclosure note covering duplicates, timing, rounding, and orphan refunds.
6. **Visual Analytics & Intelligence**:
   - **Cumulative Liquidity Curve (Area Chart)**: Inflow trajectory vs bank settlement clearing lag.
   - **Settlement Latency Histogram**: T+1 (80%), T+2 (11%), T+3+ (9%).
   - **Financial Health Score Gauge**: 98.36% Reconciliation Integrity Index.
   - **Micro-Paise Precision Deviation Matrix**: 0.4 paise deviation visual for MER006.
   - **Merchant Portfolio Settlement Matrix**: Breakdown of all 9 merchants.
7. **AI-Powered Reports & Multi-Format Export Suite (Google Gemini Integration)**:
   - **Month-End Financial Audit Dossier**: Full formal audit report downloadable in **Microsoft Word (`.docx`)**, **OpenDocument (`.odt`)**, **Printable PDF (`.pdf`)**, or Markdown (`.md`).
   - **Merchant Audit & Dispute Pack**: Tailored formal dispute letters for MER007, MER008, and MER009 in `.docx`, `.odt`, `.pdf`, and `.md`.
   - **SOX 404 Regulatory Compliance Memo**: Internal controls evaluation under Sarbanes-Oxley standards in `.docx`, `.odt`, `.pdf`, and `.md`.
   - **Accounting Balance Bridge Document**: Formal statutory audit balance bridge with mathematical zero-residual proof in `.docx`, `.odt`, `.pdf`, `.md`, and `.csv`.
   - **AI-Enriched Exceptions CSV**: Every exception row includes AI Forensic Diagnosis and Recommended Journal Adjustments.
   - **PayFlow AI Co-Pilot**: Interactive conversational financial analyst modal with rich Markdown formatting, instant greeting handling, and dynamic model discovery.

---

## 4. Google Gemini API Integration & Zero-Blocker Fallback

PayFlow connects to the Google Gemini LLM via direct REST API with dynamic self-healing model resolution:
- **How to input API Key**:
  1. Click **"Data & Settings"** in the left sidebar $\rightarrow$ paste key in **"Google Gemini API Key Configuration"** card $\rightarrow$ click **"Save Key"**.
  2. OR click the purple **"AI Co-Pilot"** button in the top bar $\rightarrow$ **"API Settings"** $\rightarrow$ paste key $\rightarrow$ click **"Save Configuration"**.
  3. OR define `VITE_GEMINI_API_KEY=AIzaSy...` in a local `.env` file.
- **Privacy**: Keys are stored exclusively in your browser's private `localStorage` (`payflow_gemini_api_key`) and never sent to any third party.
- **Zero-Blocker Fallback Mode**: If an evaluator tests PayFlow **without** an API key, the built-in autonomous financial intelligence model automatically activates, ensuring all reports, deep-dives, and briefings work instantly!

---

## 5. Local Setup & Execution Instructions

```bash
# 1. Clone repository
git clone https://github.com/Zenkairow/payflow-reconciliation-platform.git
cd payflow-reconciliation-platform

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# Open http://localhost:5173/ in your browser

# 4. Run automated test suites
node src/test-engine-scenarios.js   # 18 scenario tests
node src/test-full-qa.js            # 17 full regression tests

# 5. Build production static bundle
npm run build
```

---

## 6. Evaluator Demonstration Script (2–3 Minutes)

1. **Minute 1: Overview & Raw Data**:
   - Open [https://zenkairow.github.io/payflow-reconciliation-platform/](https://zenkairow.github.io/payflow-reconciliation-platform/).
   - View the Overview Dashboard: 35 Platform records, 35 Bank records, 34 distinct platform transactions.
   - Point out the Gross/Net amounts and highlight the +₹723.01 net variance.
2. **Minute 2: The 4 Mandatory Scenarios & AI Deep-Dive**:
   - Navigate to **Exceptions**:
     - **S1 (`TIMING_DIFFERENCE`)**: Expand `TXN026`—month-end cutoff carryover from Jan 31 to Feb 01.
     - **S2 (`ROUNDING_DIFFERENCE`)**: Expand `TXN027-029`—sub-paise accumulation resulting in ₹0.012 variance.
     - **S3 (`DUPLICATE_IN_PLATFORM`)**: Expand `TXN030`—duplicate row isolated and excluded from revenue. Click **"Run Forensic AI Deep Dive"** to view Gemini's diagnostic note.
     - **S4 (`UNMATCHED_REFUND`)**: Expand `REF002`—orphan reference to `TXN9999` with operational reserve hold.
     - **S5 (`UNEXPECTED_BANK_ENTRY`)**: Show `BNKONLY001` (₹777.00) direct bank credit.
3. **Minute 3: Visual Analytics & AI Reports**:
   - Navigate to **Visual Analytics**: Explore the Cumulative Cash Flow Area Chart and Settlement Latency Histogram.
   - Navigate to **Reports & Export**:
     - Click **"Synthesize Audit Dossier with Gemini"** $\rightarrow$ click **Word (.docx)**, **OpenDocument (.odt)**, or **PDF / Print** to download the official audit dossier.
     - Click **"Download AI-Enriched CSV"** to inspect line-by-line Gemini forensic commentary and journal entries.

---

## 7. Realistic Production Limitations (Blueprint Disclosure)

1. **Client-Side Scalability**: The current in-memory processing model is designed for monthly batches up to ~50,000 transactions; enterprise banking scale with millions of daily events requires a distributed streaming or database-backed pipeline.
2. **Stateless Browser Persistence**: Exception status updates and analyst notes reside in local component state and will reset upon hard browser reload unless backed by a persistent relational database.
3. **Synthetic Rule Boundaries**: Settlement date tolerances, fees, and currency handling are tailored to the synthetic dataset; real-world bank feeds require multi-currency exchange rate feeds and automated MT940 / CAMT.053 electronic bank statement parsers.

---

**Built with pride for the Onelab Ventures AI Native Product Manager Assessment.**
