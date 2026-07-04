# RiskAI — Critical Risk System Analysis

**Interactive risk simulation and analysis platform for complex systems**

---

## 🚀 Overview

**RiskAI** is a modern, web-based risk analysis platform built with React and Vite. It enables users to simulate and analyze systemic risks across diverse scenarios—from corporate environments to personal financial planning—through interactive, real-time risk modeling and AI-driven strategic analysis.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18.2.0
- **Build Tool:** Vite 4.4.0
- **Runtime:** Node.js 24.x
- **Deployment:** Vercel (SPA-optimized)
- **Styling:** Inline CSS-in-JS
- **Visualization:** SVG-based dynamic charts

---

## ✨ Features

### Core Capabilities
- **Multi-scenario Risk Simulation** – Analyze risk profiles across 6 domains:
  - Company (organizational risk)
  - Healthcare (health-related risks)
  - Real Estate (property/investment risk)
  - Stocks/ETF (market/investment risk)
  - Lifestyle (personal lifestyle risks)
  - Retirement (long-term financial security)

- **Real-time Risk Calculation** – Dynamic computation of stability scores and risk factors
- **Trait-based Customization** – Select up to 3 traits per simulation to refine risk modeling
- **Interactive Visualization** – Color-coded risk charts with live updates
- **Stability Evolution** – Track system stability over multi-year projections
- **AI-powered Risk Reports** – Generate strategic analysis summaries for each simulation
- **Simulation History** – Store and review up to 100 previous simulations
- **Freemium Model** – Free tier with daily usage limits; Pro tier for unlimited access

### Risk Dimensions Evaluated
- Burnout & workforce stress
- Financial instability
- Cybersecurity threats
- Automation & AI risk
- Knowledge degradation
- Dependency structures
- Market dynamics
- Operational risk
- Governance & ethics
- Reputation impact

---

## 📂 Project Structure

```
.
├── src/
│   ├── App.jsx              # Main React component (simulation engine & UI)
│   └── main.jsx             # React entry point
├── index.html               # HTML template (SPA root)
├── vite.config.js           # Vite build configuration
├── vercel.json              # Vercel deployment config (SPA rewrite)
├── package.json             # Dependencies & scripts
├── LICENSE                  # GPL-3.0 license
└── README.md                # This file
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js 24.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis.git
cd Critical-Risk-System-Analysis

# Install dependencies
npm install
```

### Local Development

```bash
npm run dev
```

The application will start at `http://localhost:5173` (Vite default).

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

### Preview Production Build Locally

```bash
npm run preview
```

---

## 🚀 Deployment

### Vercel Integration

The project is configured for seamless Vercel deployment:

1. **Framework:** Vite
2. **Build Command:** `npm install && npm run build`
3. **Output Directory:** `dist`
4. **SPA Rewrite:** All routes rewrite to `index.html` (configured in `vercel.json`)

**Deploy:**
```bash
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments on push.

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server (hot reload) |
| `npm run build` | Build for production (minified, optimized) |
| `npm run preview` | Preview production build locally |

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

### Key Points
- Modifications and derivatives must remain open-source
- Any distribution or deployment requires GPL compliance
- For commercial licensing inquiries, please contact the repository maintainers

See `LICENSE` file for full details.

---

## 🤝 Contributing

We welcome contributions! Areas of interest:

- Risk modeling algorithms
- Simulation accuracy & validation
- UI/UX improvements
- Performance optimization
- Chart visualizations
- Documentation

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 🔗 Links

- **Live Application:** https://critical-risk-system-analysis-l7cd-git-vercel-ins-3aca1c-riskai.vercel.app/
- **Repository:** https://github.com/Strategic-Systems-Lab/Critical-Risk-System-Analysis
- **License:** GPL-3.0

---

**Understanding complexity. Analyzing risk. Enabling better decisions.**
