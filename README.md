# RiskAI

Strategic risk simulation platform for organizations, real estate, investments, healthcare, lifestyle, and retirement planning.

---

## Overview

RiskAI is a React-based single-page application that simulates systemic risks across six distinct domains. Users define domain-specific parameters, configure simulation horizons, and receive risk assessments with AI-generated strategic analysis.

---

## Features

### Core Simulation
- **Six risk domains:** Company, Healthcare, Real Estate, Stocks/ETF, Lifestyle, Retirement
- **Multi-factor risk analysis** – each domain evaluates 3–7 independent risk factors
- **Real-time stability scoring** – dynamic stability evolution over simulation years (1–60 years, domain-dependent)
- **Wealth and net-worth projections** – for Real Estate (rental income), Stocks/ETF (investment returns), Retirement (pension assets), and Lifestyle (debt/savings trajectories)

### Parameter System
- **Up to 17 adjustable parameters per domain** – sliders and numeric inputs
- **Preset profiles** – quick-start configurations for each domain (e.g., Startup, National Health, Rental Portfolio, Balanced ETF)
- **Leadership style selection** (Company only) – aggressive, cooperative, authoritarian, visionary, stable
- **Trait selection** (Lifestyle only) – up to 3 traits chosen from: single income, dependents, variable income, high debt, no emergency fund, recent job loss
- **Configurable simulation years** – 1–20 years default, up to 60 years for Retirement

### Visualization & Reporting
- **Donut chart** – risk distribution across factors with color-coded severity (green stable, yellow/orange elevated, red critical)
- **Sparkline chart** – stability evolution over simulation years
- **Risk overview table** – all risk factors sorted by score
- **AI-generated strategic analysis** – rule-based engine producing situation assessment, priority actions, and risk chain explanations

### User & Plan Management
- **Free plan** – access to Company, Real Estate, Stocks/ETF, Lifestyle; limited to 3 simulations per day
- **Pro plan** – access to all 6 domains (adds Healthcare, Retirement); unlimited simulations
- **Simulation history** – stores up to 100 past simulations with full parameters and results
- **Entity naming** – custom names for each simulation

### UI & Experience
- **Dark theme** – optimized for extended viewing
- **Mobile-responsive** – single-column layout adapts to all screen sizes
- **Navigation bar** – fixed footer with 4 main sections (Simulate, History, Pricing, About)
- **Loading indicator** – progress bar with 5-step simulation feedback

---

## Tech Stack

**Dependencies:**
- React 18.2.0
- react-dom 18.2.0

**Build & Development:**
- Vite 4.4.0
- @vitejs/plugin-react 4.0.0

**Runtime:**
- Node.js 24.x

**Styling:**
- Inline CSS-in-JS (no external CSS framework)

**Visualization:**
- SVG (donut chart, sparklines)
- HTML5 Canvas (background node animation)

---

## Project Structure

```
.
├── src/
│   ├── App.jsx              Main React component (all pages, simulation engine, UI)
│   └── main.jsx             React entry point (ReactDOM.createRoot)
├── index.html               HTML template with root div and module script
├── vite.config.js           Vite configuration with React plugin
├── vercel.json              Vercel deployment config (SPA rewrite)
├── package.json             Dependencies and npm scripts
├── LICENSE                  GPL-3.0 license
└── README.md                This file
```

---

## Getting Started

### Prerequisites

- Node.js 24.x or higher
- npm or yarn

### Installation

```bash
git clone https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis.git
cd Critical-Risk-System-Analysis
npm install
```

### Local Development

```bash
npm run dev
```

Application starts at `http://localhost:5173` (Vite default).

### Build for Production

```bash
npm run build
```

Output written to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves built application locally at `http://localhost:4173`.

---

## Deployment

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

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot module reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Serve production build locally |

---

## License

Licensed under GNU General Public License v3.0 (GPL-3.0).

- Modifications and derivatives must remain open-source
- All use requires GPL-3.0 compliance
- See `LICENSE` file for full terms

---

## Contributing

Contributions welcome. Areas of interest:

- Risk modeling algorithms
- New simulation domains or parameters
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

## Version

**3.2.1**

---

## Links

- **Live Application:** https://critical-risk-system-analysis-l7cd-git-vercel-ins-3aca1c-riskai.vercel.app/
- **Repository:** https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis
- **License:** GPL-3.0
