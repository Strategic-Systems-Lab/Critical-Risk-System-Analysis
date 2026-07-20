// Vercel Serverless Function — runs on the server, not in the browser.
// .mjs extension forces ES module syntax regardless of package.json "type".
//
// Once deployed, this responds at:
//   https://critical-risk-system-analysis-l7cd.vercel.app/api/health

export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running.',
    timestamp: new Date().toISOString(),
  });
}
