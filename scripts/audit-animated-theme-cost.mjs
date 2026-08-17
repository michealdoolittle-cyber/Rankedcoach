#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const CSS_PATH = path.join(ROOT, 'public', 'app.css');
const REPORT_PATH = path.join(ROOT, 'docs', 'reports', 'animated-theme-gpu-audit-2026-08-17.md');

const EXPENSIVE_PROPERTIES = [
  'filter',
  'backdrop-filter',
  'background-position',
  'background-size',
  'box-shadow',
];

function lineForIndex(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseKeyframes(css) {
  const keyframes = new Map();
  const regex = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  let match;
  while ((match = regex.exec(css))) {
    const name = match[1];
    const openIndex = regex.lastIndex - 1;
    const closeIndex = findMatchingBrace(css, openIndex);
    if (closeIndex < 0) continue;
    const body = css.slice(openIndex + 1, closeIndex);
    const line = lineForIndex(css, match.index);
    keyframes.set(name, {
      name,
      body,
      line,
      expensive: EXPENSIVE_PROPERTIES.filter((property) => {
        const propertyRegex = new RegExp(`(^|[;{\\s])${property}\\s*:`, 'i');
        return propertyRegex.test(body);
      }),
    });
    regex.lastIndex = closeIndex + 1;
  }
  return keyframes;
}

function parseThemeRules(css, keyframes) {
  const rules = [];
  const keyframeNames = [...keyframes.keys()];
  const regex = /body\.theme-([A-Za-z0-9_-]+)[^{]*\.app-root::(?:before|after)[^{]*\{/g;
  let match;
  while ((match = regex.exec(css))) {
    const openIndex = regex.lastIndex - 1;
    const closeIndex = findMatchingBrace(css, openIndex);
    if (closeIndex < 0) continue;

    const selectorStart = css.lastIndexOf('\n', match.index) + 1;
    const selector = css.slice(selectorStart, openIndex).trim().replace(/\s+/g, ' ');
    const body = css.slice(openIndex + 1, closeIndex);
    const animationNames = [];
    const animationRegex = /animation(?:-name)?\s*:\s*([^;]+)/gi;
    let animationMatch;
    while ((animationMatch = animationRegex.exec(body))) {
      const value = animationMatch[1];
      for (const name of keyframeNames) {
        const nameRegex = new RegExp(`(^|[^A-Za-z0-9_-])${name}([^A-Za-z0-9_-]|$)`);
        if (nameRegex.test(value)) animationNames.push(name);
      }
    }

    const ruleExpensive = EXPENSIVE_PROPERTIES.filter((property) => {
      const propertyRegex = new RegExp(`(^|[;{\\s])${property}\\s*:`, 'i');
      return propertyRegex.test(body);
    });

    const keyframeExpensive = [...new Set(
      animationNames.flatMap((name) => keyframes.get(name)?.expensive ?? []),
    )];

    const riskReasons = [...new Set([...ruleExpensive, ...keyframeExpensive])];
    rules.push({
      theme: match[1],
      selector,
      line: lineForIndex(css, match.index),
      animations: [...new Set(animationNames)],
      ruleExpensive,
      keyframeExpensive,
      riskReasons,
    });

    regex.lastIndex = closeIndex + 1;
  }
  return rules;
}

function formatList(values) {
  return values.length ? values.join(', ') : 'none detected';
}

function buildReport(rules, keyframes) {
  const risky = rules.filter((rule) => rule.riskReasons.length);
  const byTheme = new Map();
  for (const rule of risky) {
    if (!byTheme.has(rule.theme)) byTheme.set(rule.theme, []);
    byTheme.get(rule.theme).push(rule);
  }

  const lines = [
    '# Animated theme GPU-cost audit — 2026-08-17',
    '',
    'This is the repo-level audit requested by `notes/collective-directive-2026-08-17-part2.md` Part B.',
    '',
    'Important boundary: this script can identify CSS patterns that commonly force paint/raster work, but it cannot replace a real Chrome DevTools Performance recording with GPU/Raster/Composite tracks on Michael’s actual high-resolution hardware. No CSS rework should be called performance-complete until that recording confirms the hotspot.',
    '',
    '## Summary',
    '',
    `- Full-viewport animated theme pseudo-element rules scanned: ${rules.length}`,
    `- Rules with paint/raster-risk properties in either the rule or its keyframes: ${risky.length}`,
    `- Themes with at least one flagged full-viewport animation: ${byTheme.size}`,
    '',
    'Risk properties searched: `filter`, `backdrop-filter`, `background-position`, `background-size`, and `box-shadow`.',
    '',
    '## Flagged themes',
    '',
  ];

  for (const [theme, themeRules] of byTheme) {
    lines.push(`### ${theme}`, '');
    for (const rule of themeRules) {
      const animationDetails = rule.animations
        .map((name) => {
          const keyframe = keyframes.get(name);
          return keyframe ? `${name} (line ${keyframe.line})` : name;
        })
        .join(', ') || 'none detected';
      lines.push(`- Line ${rule.line}: \`${rule.selector}\``);
      lines.push(`  - Animations: ${animationDetails}`);
      lines.push(`  - Rule-level properties: ${formatList(rule.ruleExpensive)}`);
      lines.push(`  - Keyframe properties: ${formatList(rule.keyframeExpensive)}`);
    }
    lines.push('');
  }

  lines.push(
    '## Recommended next step',
    '',
    'Record ~10 seconds of idle with one flagged theme active, starting with `theme-fog-drift`, in Chrome DevTools Performance on the real 4K setup. If GPU/Raster/Composite time is high, rework the flagged themes so their full-screen layers animate only `transform` and `opacity` over pre-rendered/static texture layers, instead of animating `filter`, `background-position`, or `background-size` every frame.',
    '',
  );

  return `${lines.join('\n')}\n`;
}

const css = await fs.readFile(CSS_PATH, 'utf8');
const keyframes = parseKeyframes(css);
const rules = parseThemeRules(css, keyframes);
const report = buildReport(rules, keyframes);

if (process.argv.includes('--write-report')) {
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, report, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);
} else {
  console.log(report);
}
