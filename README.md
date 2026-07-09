# 🛡️ RiskAI

**Explainable risk simulation and strategic scenario analysis across six critical domains — every result traceable back to its inputs.**

RiskAI simulates systemic risk for organizations, real estate, investment portfolios, healthcare systems, personal finances, and retirement planning. Instead of a single opaque score, each simulation produces a transparent factor breakdown, a multi-year trajectory, and — via the built-in Risk Intelligence layer — a concrete, trackable action plan.

---

## 🤔 Why This Project?

Most risk assessments are static: one questionnaire, one score, no visibility into how that score was derived or how it changes under different assumptions.

RiskAI takes a different approach. Every domain uses transparent, rule-based formulas — each risk category traces back to the specific inputs driving it. Rather than a black-box output, users see which levers matter, how sensitive a result is to unrealistic input combinations, and how it develops over a multi-year horizon.

That transparency also addresses a common weakness of one-off analysis: risk isn't a snapshot. RiskAI tracks how a simulation evolves across repeated runs, surfaces what changed and why, and turns the highest-impact risk categories into concrete next steps instead of leaving the user with a number and no direction.

The system is explicitly rule-based today, not machine-learning-driven — traceable formulas are easier to audit than opaque models. The architecture is decoupled by design so more sophisticated models can be added later without changing how results are consumed. Full detail in [Methodology & Limitations](docs/METHODOLOGY.md).

---

## Overview

RiskAI is a React single-page application built from two cooperating packages:

- **📦 Package 1 — Core Simulation Engine.** Rule-based risk models, one module per domain, plus the full UI and routing.
- **🧠 Package 2 — Risk Intelligence Layer.** A read-only extension that turns a finished simulation result into prioritized missions, trend tracking, and reminders — without ever touching Package 1's calculations.

---

## ✨ Features

### Core Simulation

- **Six risk domains:** 🏢 Company, 🏥 Healthcare, 🏠 Real Estate, 📈 Stocks/ETF, 🧍 Lifestyle, 🏦 Retirement
- **Multi-factor analysis** – up to 10 independent, deterministically-scored risk factors per domain
- **Stability scoring & trajectory** – deterministic multi-year projection (1–60 years, domain-dependent)
- **Wealth / net-worth projections** – Real Estate, Stocks/ETF, Retirement, and Lifestyle
- **Plausibility checks** – flags inconsistent inputs (e.g., rent below mortgage cost) and explains the impact directly in the report

### Parameters & Presets

- **Up to 17 parameters per domain** with preset profiles for a fast start
- **Leadership style** (Company) – six behavioral modifiers: stable, visionary, aggressive, cooperative, authoritarian, democratic
- **Trait selection** (Lifestyle) – up to 3 of 8 traits (variable income, dependents, high debt, and others)
- **Input transparency** – results show how many parameters were customized versus left at defaults

### 🧠 Risk Intelligence Layer (Package 2)

Nine modules, each reading only the generic result shape (`risks`, `stability`, `avg`, `worst`, `best`) every domain already produces — a future seventh domain works automatically, without any Package 2 changes.

| Module | Purpose |
| --- | --- |
| 🎯 **Mission Engine** | Turns the worst risk categories into missions with priority, difficulty, and — where mapped — a specific parameter hint (e.g., *"Try adjusting: pension_assets↑"*) |
| 📈 **Impact Simulator** | Projects the outcome if missions were completed, capped at what Package 1's own formulas can realistically reach |
| 🔄 **Risk Evolution** | Improved / declined / new / resolved categories versus the previous run, with magnitude tagging |
| 💡 **System Insights** | Biggest threat, highest-leverage fix (based on real projected impact), quick wins, correlated risk pairs |
| 🌟 **Opportunity Finder** | The strengths-side counterpart to System Insights — never mislabels an elevated risk as a strength |
| 🗓️ **Priority Timeline** | Missions sorted into Today / This Week / This Month / Next Quarter |
| 🔔 **Smart Reminder Engine** | Re-check reminders with urgency that adapts to the actual risk trend |
| 📊 **Risk Improvement Tracker** | Stability across every historical run of the same domain, short- and long-term trend |
| 🌐 **Digital Twin** *(optional)* | Composite system health, recovery potential, forecast confidence, maturity |

### Visualization & Reporting

- **Donut chart** – color-coded risk distribution (green stable → red critical)
- **Sparkline chart** – deterministic stability trajectory
- **Strategic analysis report** – rule-based situation assessment, root cause explanation, and priority actions; aware of plausibility warnings when they apply

### Plans, History & Legal

- **Free plan** – Company, Real Estate, Stocks/ETF, Lifestyle; 3 simulations/day
- **Pro plan** – all 6 domains, unlimited simulations
- **History** – up to 100 past simulations retained with full parameters
- **Legal page** – minimal TMG/DSGVO-compliant Impressum & Datenschutz notice

### UI

- Dark theme, mobile-responsive single-column layout, fixed 4-section navigation, 5-step loading feedback

---

## 🛠️ Recent Improvements

- **Modular domain architecture** – five of six risk domains extracted into independent modules, roughly halving the core file size and removing the practical ceiling on future growth
- **Removed a value-inflation step** that could artificially raise displayed risk percentages for already-healthy simulations
- **Deterministic forecasting** – identical inputs now always produce identical multi-year trajectories
- **Recalibrated two formulas** (Retirement's state pension shortfall sensitivity; Real Estate's interest rate exposure ceiling) that previously responded too weakly or saturated too early

---

## 🧰 Tech Stack

**Dependencies:** React 18.2.0, react-dom 18.2.0

**Build & Development:** Vite 4.4.0, @vitejs/plugin-react 4.0.0, TypeScript (Package 2 modules, transpiled via Vite's built-in esbuild — no extra build dependency)

**Runtime:** Node.js 24.x

**Styling:** Inline CSS-in-JS (no external framework)

**Visualization:** SVG (donut chart, sparklines), HTML5 Canvas (background animation)

---

## 🗂️ Project Structure

```
.
├── src/
│   ├── App.jsx                  Core app: routing, state, Company risk model, UI shell
│   ├── formulaHelpers.js        Shared risk-formula primitives (cl, risk, stab, mkY)
│   ├── legal.jsx                 Impressum & Datenschutz page
│   ├── main.jsx                  React entry point
│   │
│   ├── classes/                  One risk-model module per non-Company domain
│   │   ├── healthcare.js
│   │   ├── realEstate.js
│   │   ├── stocksEtf.js
│   │   ├── lifestyle.js
│   │   └── retirement.js
│   │
│   └── package2/                 Risk Intelligence Layer (reads Package 1 output only)
│       ├── index.ts               Public entry point
│       ├── engine.ts              Orchestrator with caching and fail-safes
│       ├── missionEngine.ts       Module 1 — Mission Engine
│       ├── impactSimulator.ts     Module 2 — Impact Simulator
│       ├── riskEvolution.ts       Module 3 — Risk Evolution
│       ├── systemInsights.ts      Module 4 — System Insights
│       ├── opportunityFinder.ts   Module 5 — Opportunity Finder
│       ├── priorityTimeline.ts    Module 6 — Priority Timeline
│       ├── reminderEngine.ts      Module 7 — Smart Reminder Engine
│       ├── progressTracker.ts     Module 8 — Risk Improvement Tracker
│       ├── digitalTwin.ts         Module 9 — Digital Twin (optional)
│       ├── driverHints.ts         Per-domain, per-category parameter guidance
│       ├── ui.tsx                 Result cards
│       └── types.ts / helpers.ts / constants.ts / config.ts / demoData.ts
│
├── docs/
│   └── METHODOLOGY.md            Methodology, explainability, assumptions, limitations
│
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
├── LICENSE                       GPL-3.0
└── README.md
```

---

## 📚 Documentation

- [Methodology & Limitations](docs/METHODOLOGY.md) – how risk scores are calculated, explainability approach, assumptions, and known limitations
- [Architecture](#project-structure) – project structure, above

---

## 📜 Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production bundle |
| `npm run preview` | Serve production build locally |

---

## 📄 License

GNU General Public License v3.0 (GPL-3.0). Modifications and derivatives must remain open-source. See `LICENSE` for full terms.

---

## Version

**3.2.1**

---

## Links

- **Live Application:** <https://critical-risk-system-analysis-l7cd.vercel.app>
- **Repository:** <https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis>
- **License:** GPL-3.0
