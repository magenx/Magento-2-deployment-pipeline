const { pagespeedonline } = require('@googleapis/pagespeedonline');
const fs = require('fs');

// Inputs
const url = process.argv[2] || 'https://www.hyva.io';
const strategy = process.argv[3] || 'mobile';
const psiKey = process.argv[4];
const cruxKey = process.argv[5];
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

// Helpers
function badge(score) {
  if (score === 'N/A') return 'N/A';
  if (score >= 90) return `🟢 ${score}`;
  if (score >= 50) return `🟡 ${score}`;
  return `🔴 ${score}`;
}

async function getCruxData(origin, apiKey) {
  const apiUrl = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${apiKey}`;
  const body = { origin };

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`CrUX API error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch CrUX data:', e.message);
    return null;
  }
}

async function getPageSpeedData(url, strategy, key) {
  const client = pagespeedonline('v5');
  try {
    const res = await client.pagespeedapi.runpagespeed({
      url,
      strategy,
      key,
      category: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    return res.data;
  } catch (e) {
    console.error('Failed to fetch PageSpeed Insights data:', e.message);
    return null;
  }
}

function formatCruxTable(crux) {
  if (!crux || !crux.record) return 'CrUX data not available.\n';
  const metrics = crux.record.metrics || {};
  let table = `| Metric | Good | Needs Improvement | Poor |\n|---|---|---|---|\n`;

  const metricMap = {
    'first_contentful_paint': 'First Contentful Paint',
    'largest_contentful_paint': 'Largest Contentful Paint',
    'cumulative_layout_shift': 'Cumulative Layout Shift',
    'first_input_delay': 'First Input Delay',
    'interaction_to_next_paint': 'Interaction to Next Paint',
    'experimental_time_to_first_byte': 'Time To First Byte'
  };

  for (const key in metricMap) {
    if (metrics[key]) {
      const histogram = metrics[key].histogram || [];
      const [good, ni, poor] = [
        Math.round((histogram[0]?.density || 0) * 100),
        Math.round((histogram[1]?.density || 0) * 100),
        Math.round((histogram[2]?.density || 0) * 100)
      ];
      table += `| ${metricMap[key]} | ${good}% | ${ni}% | ${poor}% |\n`;
    }
  }
  return table || 'No CrUX metrics available.\n';
}

function formatLighthouseTable(lh) {
  if (!lh) return 'Lighthouse data not available.\n';
  const cats = lh.lighthouseResult.categories;
  let table = `| Category | Score |\n|---|---|\n`;
  table += `| Performance | ${badge(cats.performance ? Math.round(cats.performance.score * 100) : 'N/A')} |\n`;
  table += `| Accessibility | ${badge(cats.accessibility ? Math.round(cats.accessibility.score * 100) : 'N/A')} |\n`;
  table += `| Best Practices | ${badge(cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : 'N/A')} |\n`;
  table += `| SEO | ${badge(cats.seo ? Math.round(cats.seo.score * 100) : 'N/A')} |\n`;
  return table;
}

function formatLighthouseMetricsTable(lh) {
  if (!lh) return '';
  const audits = lh.lighthouseResult.audits;
  let table = `| Metric | Value |\n|---|---|\n`;
  table += `| First Contentful Paint | ${audits['first-contentful-paint']?.displayValue || 'N/A'} |\n`;
  table += `| Speed Index | ${audits['speed-index']?.displayValue || 'N/A'} |\n`;
  table += `| Largest Contentful Paint | ${audits['largest-contentful-paint']?.displayValue || 'N/A'} |\n`;
  table += `| Total Blocking Time | ${audits['total-blocking-time']?.displayValue || 'N/A'} |\n`;
  table += `| Time to Interactive | ${audits['interactive']?.displayValue || 'N/A'} |\n`;
  return table;
}

(async () => {
  let origin;
  try { origin = new URL(url).origin; } catch { origin = url; }

  // Fetch data
  const [crux, psi] = await Promise.all([
    getCruxData(origin, cruxKey),
    getPageSpeedData(url, strategy, psiKey)
  ]);

  // Compose Markdown
  let md = `## PageSpeed & CrUX Report\n\n`;

  md += `### CrUX Real-User Experience (28-day Field Data)\n`;
  md += formatCruxTable(crux);
  md += `\n`;

  md += `### Lighthouse Category Scores (Lab Data)\n`;
  md += formatLighthouseTable(psi);
  md += `\n`;

  md += `### Lighthouse Key Metrics\n`;
  md += formatLighthouseMetricsTable(psi);

  // Output
  if (summaryPath) {
    fs.appendFileSync(summaryPath, md);
    console.log("Summary written to GitHub Actions step summary.");
  } else {
    console.log(md);
  }
})();
