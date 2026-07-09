# 🛡️ RiskAI

Strategic risk simulation platform for organizations, real estate, investments, healthcare, lifestyle, and retirement planning — now with a built-in Risk Intelligence layer that turns every result into concrete, trackable next steps.

---

## 🧭 Overview

RiskAI is a React-based single-page application that simulates systemic risks across six distinct domains. Users define domain-specific parameters, configure simulation horizons, and receive risk assessments with AI-generated strategic analysis.

As of this release, RiskAI consists of two cooperating packages:

- **📦 Package 1 — Core Simulation Engine.** The risk models themselves, now split into one module per domain for maintainability, plus the full UI, routing, and legal pages.
- **🧠 Package 2 — Risk Intelligence Layer.** A read-only extension that sits on top of every simulation result and answers the next question after "what's my risk?": *what should I actually do about it, and is it getting better?*

---

## ✨ Features

### 🎯 Core Simulation

- **Six risk domains:** 🏢 Company, 🏥 Healthcare, 🏠 Real Estate, 📈 Stocks/ETF, 🧍 Lifestyle, 🏦 Retirement
- **Multi-factor risk analysis** – each domain evaluates up to 10 independent risk factors
- **Real-time stability scoring** – dynamic, deterministic stability evolution over simulation years (1–60 years, domain-dependent)
- **Wealth and net-worth projections** – for Real Estate (rental income), Stocks/ETF (investment returns), Retirement (pension assets), and Lifestyle (debt/savings trajectories)
- **Plausibility checks** ⚠️ – domain-specific sanity warnings (e.g., rent not covering mortgage costs, expenses exceeding income) that explain *why* a result looks the way it does, directly in the strategic report

### 🎛️ Parameter System

- **Up to 17 adjustable parameters per domain** – sliders and numeric inputs
- **Preset profiles** – quick-start configurations for each domain (e.g., Startup, National Health, Rental Portfolio, Balanced ETF)
- **Leadership style selection** (Company only) – six styles: stable, visionary, aggressive, cooperative, authoritarian, democratic
- **Trait selection** (Lifestyle only) – up to 3 traits chosen from 8 available (variable income, dependents, high debt, no emergency fund, and others)
- **Configurable simulation years** – 1–20 years default, up to 60 years for Retirement
- **Input transparency** ✅ – results show how many of the available parameters were customized versus left at defaults

### 🧠 Risk Intelligence Layer (Package 2)

A modular, TypeScript-based extension that reads a finished simulation result and layers nine independent modules on top of it — without ever recalculating or modifying Package 1's own risk model.

| Module | Purpose |
| --- | --- |
| 🎯 **Mission Engine** | Converts the worst risk categories into concrete missions, each with priority, difficulty, estimated time, and — where available — a specific parameter-level hint (e.g., *"Try adjusting: pension_assets↑ / state_pension_reliance↑"*) |
| 📈 **Impact Simulator** | Projects the stability/risk outcome if generated missions were completed, capped at the same ceiling Package 1's own formulas can realistically reach |
| 🔄 **Risk Evolution** | Compares the current simulation against the previous one for the same entity: improved, declined, newly appeared, and resolved risk categories, with magnitude tagging for major shifts |
| 💡 **System Insights** | Surfaces the biggest threat, the highest-leverage fix (based on real projected mission impact, not guesswork), quick wins, and correlated risk pairs |
| 🌟 **Opportunity Finder** | The strengths-side counterpart to System Insights — highlights well-managed areas worth leveraging, never mislabeling an elevated risk as a strength |
| 🗓️ **Priority Timeline** | Sorts generated missions into Today / This Week / This Month / Next Quarter |
| 🔔 **Smart Reminder Engine** | Generates re-check reminders with urgency that adapts to actual risk trend (e.g., 14 days instead of 30 when risk is rising) |
| 📊 **Risk Improvement Tracker** | Tracks stability across every historical simulation of the same domain, including a short-term trend alongside the long-term trajectory |
| 🌐 **Digital Twin** *(optional)* | Composite system health, recovery potential, forecast confidence, and overall maturity score |

Every module is class-agnostic — it reads only the generic shape every domain already produces (`risks`, `stability`, `avg`, `worst`, `best`), so a future seventh risk domain works automatically without any changes to Package 2.

### 📊 Visualization & Reporting

- **Donut chart** 🍩 – risk distribution across factors with color-coded severity (green stable, yellow/orange elevated, red critical)
- **Sparkline chart** 📉 – deterministic stability evolution over simulation years
- **Risk overview table** – all risk factors sorted by score
- **AI-generated strategic analysis** 🤖 – rule-based engine producing situation assessment, priority actions, and risk chain explanations, now aware of plausibility warnings when they apply

### 👤 User & Plan Management

- **Free plan** – access to Company, Real Estate, Stocks/ETF, Lifestyle; limited to 3 simulations per day
- **💎 Pro plan** – access to all 6 domains (adds Healthcare, Retirement); unlimited simulations
- **Simulation history** 📋 – stores up to 100 past simulations with full parameters and results
- **Entity naming** – custom names for each simulation

### ⚖️ Legal & Compliance

- **Impressum & Datenschutz page** – minimal, TMG/DSGVO-compliant legal notice, accessible from the About page footer, kept as a self-contained module

### 🎨 UI & Experience

- **Dark theme** 🌙 – optimized for extended viewing
- **Mobile-responsive** 📱 – single-column layout adapts to all screen sizes, with balanced text wrapping to avoid orphaned line breaks
- **Navigation bar** – fixed footer with 4 main sections (⚡ Simulate, 📋 History, 💎 Pricing, 📖 About)
- **Loading indicator** ⏳ – progress bar with 5-step simulation feedback

---

## 🛠️ Recent Improvements

This release includes a significant internal restructuring and several risk-model corrections, all verified against the original formulas to confirm zero unintended behavior change:

- 🏗️ **Modular domain architecture** – Package 1's five non-Company risk domains were extracted from the main application file into independent modules, roughly halving the core file size and removing the practical ceiling on future growth
- 🐛 **Removed a value-inflation step** that could artificially raise displayed risk percentages for already-healthy simulations
- ⚙️ **Made the multi-year stability forecast deterministic** – identical inputs now always produce identical results
- 🔧 **Recalibrated two risk formulas** (Retirement's state pension shortfall sensitivity, and Real Estate's interest rate exposure ceiling) that previously saturated too early or responded too weakly to realistic parameter ranges

---

## 🧰 Tech Stack

**Dependencies:**

- React 18.2.0
- react-dom 18.2.0

**Build & Development:**

- Vite 4.4.0
- @vitejs/plugin-react 4.0.0
- TypeScript (Package 2 modules; transpiled via Vite's built-in esbuild, no additional build dependency required)

**Runtime:**

- Node.js 24.x

**Styling:**

- Inline CSS-in-JS (no external CSS framework)

**Visualization:**

- SVG (donut chart, sparklines)
- HTML5 Canvas (background node animation)

---

## 🗂️ Project Structure

```
.
├── src/
│   ├── App.jsx                  Core app: routing, state, Company risk model, UI shell
│   ├── formulaHelpers.js        Shared risk-formula primitives (cl, risk, stab, mkY)
│   ├── legal.jsx                 Impressum & Datenschutz page
│   ├── main.jsx                  React entry point (ReactDOM.createRoot)
│   │
│   ├── classes/                  One risk-model module per non-Company domain
│   │   ├── healthcare.js
│   │   ├── realEstate.js
│   │   ├── stocksEtf.js
│   │   ├── lifestyle.js
│   │   └── retirement.js
│   │
│   └── package2/                 Risk Intelligence Layer (reads Package 1 output only)
│       ├── index.ts               Public entry point (generateRiskIntelligence, RiskIntelligencePanel)
│       ├── engine.ts              Orchestrator with caching and fail-safes
│       ├── missionEngine.ts       Module 1 — 🎯 Mission Engine
│       ├── impactSimulator.ts     Module 2 — 📈 Impact Simulator
│       ├── riskEvolution.ts       Module 3 — 🔄 Risk Evolution
│       ├── systemInsights.ts      Module 4 — 💡 System Insights
│       ├── opportunityFinder.ts   Module 5 — 🌟 Opportunity Finder
│       ├── priorityTimeline.ts    Module 6 — 🗓️ Priority Timeline
│       ├── reminderEngine.ts      Module 7 — 🔔 Smart Reminder Engine
│       ├── progressTracker.ts     Module 8 — 📊 Risk Improvement Tracker
│       ├── digitalTwin.ts         Module 9 — 🌐 Digital Twin (optional)
│       ├── driverHints.ts         Per-domain, per-category parameter guidance
│       ├── ui.tsx                 All 9 result cards
│       ├── types.ts / helpers.ts / constants.ts / config.ts / demoData.ts
│       └── (config.ts DEMO_MODE flag enables fully standalone testing)
│
├── index.html                    HTML template with root div and module script
├── vite.config.js                Vite configuration with React plugin
├── vercel.json                   Vercel deployment config (SPA rewrite)
├── package.json                  Dependencies and npm scripts
├── LICENSE                       GPL-3.0 license
└── README.md                     This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 24.x or higher
- npm or yarn

### Installation

```
git clone https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis.git
cd Critical-Risk-System-Analysis
npm install
```

### Local Development

```
npm run dev
```

Application starts at `http://localhost:5173` (Vite default).

### Build for Production

```
npm run build
```

Output written to `dist/` directory.

### Preview Production Build

```
npm run preview
```

Serves built application locally at `http://localhost:4173`.

---

## ☁️ Deployment

### Vercel

Application is configured for Vercel:

**Configuration (vercel.json):**

- Framework: Vite
- Build Command: `npm install && npm run build`
- Output Directory: `dist`
- SPA Handling: All routes rewrite to `/index.html`

**To deploy:**

- Connect GitHub repository to Vercel for automatic deployments on push, or
- Run `vercel deploy` locally

---

## 📜 Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server with hot module reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Serve production build locally |

---

## 📄 License

Licensed under GNU General Public License v3.0 (GPL-3.0).

- Modifications and derivatives must remain open-source
- All use requires GPL-3.0 compliance
- See `LICENSE` file for full terms

---

## 🤝 Contributing

Contributions welcome. Areas of interest:

- Risk modeling algorithms and formula calibration
- New simulation domains (add a module under `src/classes/`)
- New Risk Intelligence modules or refinements under `src/package2/`
- UI/UX improvements
- Performance optimization
- Visualization enhancements
- Documentation

**To contribute:**

1. Fork repository
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Describe changes'`)
4. Push branch (`git push origin feature/your-feature`)
5. Open Pull Request

---

## 🏷️ Version

**3.2.1** — Modular Package 1 architecture, full Package 2 Risk Intelligence Layer, formula corrections.

---

## 🔗 Links

- **🌐 Live Application:** <https://critical-risk-system-analysis-l7cd.vercel.app>
- **📂 Repository:** <https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis>
- **📄 License:** GPL-3.0
