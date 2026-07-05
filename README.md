# RiskAI — Critical Risk System Analysis

Strategic risk simulation and analysis platform for organizations, investments, and personal finance.

---

## Overview

**RiskAI** is a React-based web application that enables users to simulate and analyze systemic risks across six distinct domains: companies, healthcare systems, real estate portfolios, stock/ETF investments, personal lifestyle finances, and retirement planning. Users input domain-specific parameters, run simulations over configurable time horizons, and receive risk assessments with strategic analysis.

---

## Features

### Simulation System
- **Six risk domains:** Company, Healthcare, Real Estate, Stocks/ETF, Lifestyle, Retirement
- **Real-time risk calculation** with multi-factor analysis per domain
- **Stability scoring** and year-by-year evolution tracking
- **Wealth/Net-worth projections** for applicable domains (Real Estate, Stocks, Retirement, Lifestyle)

### Customization & Input
- **Parameter-driven simulation** – up to 17 adjustable parameters per domain
- **Preset profiles** for quick scenario setup
- **Leadership style selection** (Company domain only: aggressive, cooperative, authoritarian, visionary, stable)
- **Trait selection** (Lifestyle domain only: up to 3 traits from available options)
- **Time-horizon control** (1–60 years, domain-dependent)

### Visualization & Analysis
- **Donut chart visualization** – Risk distribution across factors with color-coded severity (green=stable, yellow/orange=elevated, red=critical)
- **Sparkline charts** – Stability evolution over simulation period
- **Risk overview table** – Sorted risk factors with percentage scores
- **AI-generated strategic reports** – Rule-based analysis engine providing situation assessment, priority actions, and risk chain analysis

### User Management
- **Free plan:** Access to 4 domains (Company, Real Estate, Stocks/ETF, Lifestyle) with daily limit of 3 simulations
- **Pro plan:** Access to all 6 domains with unlimited simulations
- **Pricing page** with plan comparison and payment integration placeholder (Stripe)

### Additional
- **Simulation history** – Store and review up to 100 past simulations
- **Entity naming** – Assign custom names to simulations
- **Dark theme UI** – Optimized for mobile and desktop viewing

---

## Tech Stack

- **Frontend:** React 18.2.0
- **Build Tool:** Vite 4.4.0
- **React Plugin:** @vitejs/plugin-react 4.0.0
- **Runtime:** Node.js 24.x
- **Styling:** Inline CSS-in-JS (no external CSS framework)
- **Visualization:** SVG (charts) + Canvas (background animation)

---

## Project Structure

```
.
├── src/
│   ├── App.jsx              Main React component (all pages, simulation logic, UI)
│   └── main.jsx             React entry point with ReactDOM.createRoot()
├── index.html               HTML template with root div and module script
├── vite.config.js           Vite configuration with React plugin
├── vercel.json              Vercel deployment config (SPA rewrite rules)
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

The app will start at `http://localhost:5173` (Vite default).

### Build for Production

```bash
npm run build
```

Output is written to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the built application locally at `http://localhost:4173`.

---

## Deployment

### Vercel

The application is configured for Vercel deployment:

1. **Framework:** Vite
2. **Build Command:** `npm install && npm run build`
3. **Output Directory:** `dist`
4. **SPA Handling:** All routes rewrite to `/index.html`

**To deploy:**
- Connect your GitHub repository to Vercel, or
- Run `vercel deploy` in the project directory

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

- Modifications and derivatives must remain open-source
- All use requires GPL-3.0 compliance
- See `LICENSE` file for full text

---

## Contributing

Contributions are welcome. Areas of interest include:

- Risk modeling algorithms and accuracy
- New simulation domains or parameters
- UI/UX improvements
- Performance optimization
- Visualization enhancements
- Documentation

**To contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Describe your changes'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Version

Current version: **3.2.1**

---

## Links

- **Live Application:** https://critical-risk-system-analysis-l7cd-git-vercel-ins-3aca1c-riskai.vercel.app/
- **Repository:** https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis
- **License:** GPL-3.0 (see `LICENSE` file)
