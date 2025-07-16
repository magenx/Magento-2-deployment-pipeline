const { pagespeedonline } = require('@googleapis/pagespeedonline');
const fs = require('fs');

const url = process.argv[2] || 'https://www.hyva.io';
const strategy = process.argv[3] || 'mobile';
const key = process.argv[4];
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

async function run() {
  const client = pagespeedonline('v5');
  try {
    const res = await client.pagespeedapi.runpagespeed({
      url,
      strategy,
      key,
    });

    const id = res.data.id;
    let markdown = `## PageSpeed Insights Report\n\n`;

    // CrUX metrics
    const cruxData = res.data.loadingExperience?.metrics || {};
    markdown += `### Chrome User Experience Report Results\n`;
    markdown += `| Metric | Category |\n|---|---|\n`;
    markdown += `| First Contentful Paint | ${cruxData.FIRST_CONTENTFUL_PAINT_MS?.category || 'N/A'} |\n`;
    markdown += `| Interaction to Next Paint | ${cruxData.INTERACTION_TO_NEXT_PAINT?.category || 'N/A'} |\n`;

    // Lighthouse metrics
    const lh = res.data.lighthouseResult;
    markdown += `\n### Lighthouse Results\n`;
    markdown += `| Metric | Value |\n|---|---|\n`;
    markdown += `| Performance Score | ${lh.categories.performance.score !== undefined ? Math.round(lh.categories.performance.score * 100) : 'N/A'} |\n`;
    markdown += `| First Contentful Paint | ${lh.audits['first-contentful-paint']?.displayValue || 'N/A'} |\n`;
    markdown += `| Speed Index | ${lh.audits['speed-index']?.displayValue || 'N/A'} |\n`;
    markdown += `| Largest Contentful Paint | ${lh.audits['largest-contentful-paint']?.displayValue || 'N/A'} |\n`;
    markdown += `| Total Blocking Time | ${lh.audits['total-blocking-time']?.displayValue || 'N/A'} |\n`;
    markdown += `| Time to Interactive | ${lh.audits['interactive']?.displayValue || 'N/A'} |\n`;

    // Output to summary if available, else to console
    if (summaryPath) {
      fs.appendFileSync(summaryPath, markdown);
      console.log("Summary written to GitHub Actions step summary.");
    } else {
      console.log(markdown);
    }
  } catch (e) {
    console.error('Error running PageSpeed:', e.message);
    process.exit(1);
  }
}

run();
