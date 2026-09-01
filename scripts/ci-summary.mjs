/**
 * Writes the last run's results to the GitHub Actions run summary, so a red
 * build can be read on the run page without downloading the report artifact.
 *
 * Reads the JSON reporter output, the same file the defect-triage agent uses.
 */
import { readFileSync, appendFileSync } from 'node:fs';

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (!summaryFile) {
  console.error('GITHUB_STEP_SUMMARY is not set; nothing to write.');
  process.exit(0);
}

let report;
try {
  report = JSON.parse(readFileSync('test-results/results.json', 'utf8'));
} catch {
  appendFileSync(summaryFile, '## Playwright\n\nNo results file was produced.\n');
  process.exit(0);
}

// The JSON reporter nests suites by file and then by describe block.
const specs = [];
const walk = (suite, file) => {
  const current = suite.file ?? file;
  suite.specs?.forEach((spec) => specs.push({ ...spec, file: current }));
  suite.suites?.forEach((child) => walk(child, current));
};
report.suites?.forEach((suite) => walk(suite));

const icon = { expected: '✅', unexpected: '❌', flaky: '⚠️', skipped: '⏭️' };
const statusOf = (spec) => spec.tests?.[0]?.status ?? (spec.ok ? 'expected' : 'unexpected');
const durationOf = (spec) =>
  spec.tests?.[0]?.results?.reduce((total, result) => total + (result.duration ?? 0), 0) ?? 0;

// Playwright colours its error messages; the codes are noise in markdown.
const stripAnsi = (text) => text.replace(/\u001b\[[0-9;]*m/g, '');

const stats = report.stats ?? {};
const failed = specs.filter((spec) => statusOf(spec) === 'unexpected');

const lines = [
  '## Playwright results',
  '',
  `${stats.expected ?? 0} passed · ${stats.unexpected ?? 0} failed · ${stats.flaky ?? 0} flaky · ` +
    `${stats.skipped ?? 0} skipped · ${Math.round((stats.duration ?? 0) / 1000)}s`,
  '',
  '| | Test | Case | Time |',
  '| --- | --- | --- | --- |',
  ...specs.map((spec) => {
    // The JSON reporter drops the leading @; the docs and the agent use it.
    const tags = (spec.tags ?? []).map((tag) => `@${tag.replace(/^@/, '')}`).join(' ') || '—';
    const time = `${Math.round(durationOf(spec))}ms`;
    return `| ${icon[statusOf(spec)] ?? '•'} | ${spec.title} | ${tags} | ${time} |`;
  }),
];

if (failed.length) {
  lines.push('', '### Failures', '');
  for (const spec of failed) {
    const message = spec.tests?.[0]?.results?.[0]?.error?.message ?? 'No error message recorded.';
    lines.push(
      `**${spec.title}** \`${spec.file}\``,
      '',
      '```',
      stripAnsi(message).split('\n').slice(0, 12).join('\n'),
      '```',
      '',
    );
  }
  lines.push('The full HTML report and traces are in the **playwright-report** artifact below.');
}

appendFileSync(summaryFile, lines.join('\n') + '\n');
