#!/usr/bin/env node

/**
 * CSS Variables and Color Format Checker
 * 1. Validates that all CSS variables used in Tailwind config are defined
 * 2. Checks color custom properties for consistent HSL format
 * Prevents issues like missing variables and RGB/HSL format mixing
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Read Tailwind config
const require = createRequire(import.meta.url);
const tailwindConfig = require('../tailwind.config.cjs');

// Read CSS file
const cssContent = fs.readFileSync('src/index.css', 'utf8');

// Extract CSS variables from CSS file
const definedVariables = new Set();
const cssVarRegex = /--([a-zA-Z0-9-]+)\s*:/g;
let match;
while ((match = cssVarRegex.exec(cssContent)) !== null) {
  definedVariables.add(`--${match[1]}`);
}

// Extract CSS variables used in Tailwind config
const usedVariables = new Set();
const configString = JSON.stringify(tailwindConfig);
const varRegex = /var\((--[a-zA-Z0-9-]+)\)/g;
while ((match = varRegex.exec(configString)) !== null) {
  usedVariables.add(match[1]);
}

// Find undefined variables
const undefinedVariables = [];
// Variables that are set dynamically by libraries (exclude from validation)
const dynamicVariables = new Set([
  '--radix-accordion-content-height', // Set by Radix UI at runtime
]);

for (const variable of usedVariables) {
  if (!definedVariables.has(variable) && !dynamicVariables.has(variable)) {
    undefinedVariables.push(variable);
  }
}

// Check color formats in CSS custom properties
const colorFormatIssues = [];

// Extract CSS custom properties that should be colors
const colorPropertyRegex = /--(background|foreground|primary|secondary|accent|destructive|muted|border|input|ring|card|popover|chart|sidebar)(?!-size|-position|-repeat|-attachment|-clip|-origin|-image)(?:-[^:]*)?:\s*([^;]+);/g;

let colorMatch;
while ((colorMatch = colorPropertyRegex.exec(cssContent)) !== null) {
  const propertyName = colorMatch[1];
  const value = colorMatch[2].trim();
  
  // Skip non-color values (like --radius)
  if (value.includes('rem') || value.includes('px') || value.includes('calc')) {
    continue;
  }
  
  // Check for RGB format (3 numbers separated by spaces, no % signs)
  const rgbPattern = /^\d+\s+\d+\s+\d+$/;
  if (rgbPattern.test(value)) {
    colorFormatIssues.push({
      property: `--${propertyName}`,
      value: value,
      issue: 'RGB format detected - should use HSL format',
      suggestion: 'Convert to HSL format like "220 13% 91%"'
    });
  }
  
  // Check for comma-separated RGB
  const rgbCommaPattern = /^\d+,\s*\d+,\s*\d+$/;
  if (rgbCommaPattern.test(value)) {
    colorFormatIssues.push({
      property: `--${propertyName}`,
      value: value,
      issue: 'Comma-separated RGB format detected',
      suggestion: 'Convert to HSL format like "220 13% 91%"'
    });
  }
  
  // Check for rgb() or rgba() functions
  if (value.startsWith('rgb(') || value.startsWith('rgba(')) {
    colorFormatIssues.push({
      property: `--${propertyName}`,
      value: value,
      issue: 'RGB function format detected',
      suggestion: 'Use HSL values directly like "220 13% 91%" (no hsl() wrapper needed)'
    });
  }
}

// Report results
let hasIssues = false;

if (undefinedVariables.length > 0) {
  console.error('❌ Undefined CSS variables found in tailwind.config.cjs:');
  undefinedVariables.forEach(variable => {
    console.error(`   ${variable}`);
  });
  console.error(`\nAdd these variables to src/index.css`);
  hasIssues = true;
}

if (colorFormatIssues.length > 0) {
  if (hasIssues) console.error(''); // Add spacing
  console.error('❌ Color format issues found in src/index.css:');
  colorFormatIssues.forEach((issue, index) => {
    console.error(`   ${index + 1}. ${issue.property}`);
    console.error(`      Value: ${issue.value}`);
    console.error(`      Issue: ${issue.issue}`);
    console.error(`      Fix: ${issue.suggestion}`);
  });
  console.error(`\nColor format consistency is critical to prevent rendering issues.`);
  hasIssues = true;
}

if (hasIssues) {
  process.exit(1);
} else {
  console.log('✅ All CSS variables in tailwind.config.cjs are defined');
  console.log('✅ All color formats are consistent and valid');
}