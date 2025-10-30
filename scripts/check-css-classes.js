#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * CSS Class Usage Checker
 * Detects undefined CSS classes used in JSX/TSX files
 * Prevents issues like missing gradient-bg class
 */

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Extract CSS classes from CSS files
function extractCSSClasses() {
  const cssClasses = new Set();
  
  try {
    // Read main CSS file
    const cssContent = fs.readFileSync('src/index.css', 'utf8');
    
    // Extract class definitions (both .class and @apply patterns)
    const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;
    let match;
    while ((match = classRegex.exec(cssContent)) !== null) {
      cssClasses.add(match[1]);
    }
    
    // Also check for any additional CSS files
    const cssFiles = glob.sync('src/**/*.css');
    for (const file of cssFiles) {
      if (file === 'src/index.css') continue; // Already processed
      const content = fs.readFileSync(file, 'utf8');
      while ((match = classRegex.exec(content)) !== null) {
        cssClasses.add(match[1]);
      }
    }
    
    console.log(`${colors.cyan}Found ${cssClasses.size} CSS classes defined${colors.reset}`);
    return cssClasses;
  } catch (error) {
    console.error(`${colors.red}Error reading CSS files: ${error.message}${colors.reset}`);
    return new Set();
  }
}

// Extract Tailwind classes from node_modules (common ones)
function getTailwindClasses() {
  // Comprehensive Tailwind patterns - covers 99% of Tailwind classes
  const tailwindPatterns = [
    // Layout
    /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
    /^(static|fixed|absolute|relative|sticky)$/,
    /^(inset|inset-x|inset-y|top|right|bottom|left)(-\d+|-(px|auto|full))?$/,
    /^(inset|inset-x|inset-y|top|right|bottom|left)-(1\/2|1\/3|2\/3|1\/4|2\/4|3\/4|1\/5|2\/5|3\/5|4\/5|1\/6|2\/6|3\/6|4\/6|5\/6|1\/12|2\/12|3\/12|4\/12|5\/12|6\/12|7\/12|8\/12|9\/12|10\/12|11\/12)$/,
    /^(visible|invisible|collapse)$/,
    
    // Flexbox & Grid
    /^(flex-row|flex-row-reverse|flex-col|flex-col-reverse|flex-wrap|flex-wrap-reverse|flex-nowrap)$/,
    /^(flex-(1|auto|initial|none))$/,
    /^(grow|grow-0|shrink|shrink-0)$/,
    /^(flex-shrink-0|flex-shrink)$/,
    /^(flex-grow-0|flex-grow)$/,
    /^(justify-(start|end|center|between|around|evenly))$/,
    /^(items-(start|end|center|baseline|stretch))$/,
    /^(content-(start|end|center|between|around|evenly))$/,
    /^(self-(auto|start|end|center|stretch|baseline))$/,
    /^(place-(content|items|self)-(start|end|center|between|around|evenly|stretch))$/,
    /^(grid-cols-(\d+|none|subgrid))$/,
    /^(grid-rows-(\d+|none|subgrid))$/,
    /^(col-(auto|span-\d+|start-\d+|end-\d+))$/,
    /^(row-(auto|span-\d+|start-\d+|end-\d+))$/,
    /^(gap|gap-x|gap-y)-(\d+|px)$/,
    
    // Spacing
    /^(m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-(\d+|px|auto)$/,
    /^(space-x|space-y)-(\d+|px|reverse)$/,
    
    // Sizing
    /^(w|h|min-w|min-h|max-w|max-h)-(\d+|px|auto|full|screen|min|max|fit|prose|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/,
    /^(w|h)-(1\/2|1\/3|2\/3|1\/4|2\/4|3\/4|1\/5|2\/5|3\/5|4\/5|1\/6|2\/6|3\/6|4\/6|5\/6|1\/12|2\/12|3\/12|4\/12|5\/12|6\/12|7\/12|8\/12|9\/12|10\/12|11\/12)$/,
    /^(size)-(\d+|px|auto|full)$/,
    
    // Typography
    /^(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))$/,
    /^(font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black))$/,
    /^(font-(sans|serif|mono))$/,
    /^(italic|not-italic)$/,
    /^(text-(left|center|right|justify|start|end))$/,
    /^(leading-(none|tight|snug|normal|relaxed|loose|\d+))$/,
    /^(tracking-(tighter|tight|normal|wide|wider|widest))$/,
    /^(text-(ellipsis|clip))$/,
    /^(whitespace-(normal|nowrap|pre|pre-line|pre-wrap))$/,
    /^(break-(normal|words|all|keep))$/,
    
    // Colors (comprehensive)
    /^(text|bg|border|ring|shadow|accent|caret|fill|stroke|outline|decoration)-(inherit|current|transparent|black|white)$/,
    /^(text|bg|border|ring|shadow|accent|caret|fill|stroke|outline|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    /^(text|bg|border|ring|shadow|accent|caret|fill|stroke|outline|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\/(5|10|20|25|30|40|50|60|70|75|80|90|95)$/,
    
    // Borders
    /^(border|border-t|border-r|border-b|border-l|border-x|border-y)(-\d+)?$/,
    /^(border-(solid|dashed|dotted|double|hidden|none))$/,
    /^(rounded|rounded-t|rounded-r|rounded-b|rounded-l|rounded-tl|rounded-tr|rounded-br|rounded-bl)(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
    /^(ring|ring-inset)(-\d+)?$/,
    /^(ring-offset)-(\d+)$/,
    
    // Effects
    /^(shadow|shadow-sm|shadow-md|shadow-lg|shadow-xl|shadow-2xl|shadow-inner|shadow-none)$/,
    /^(opacity)-(\d+)$/,
    /^(mix-blend)-(normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)$/,
    /^(bg-blend)-(normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity)$/,
    
    // Filters
    /^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia)(-none|-sm|-md|-lg|-xl|-2xl|-3xl)?$/,
    /^(backdrop-(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia))(-none|-sm|-md|-lg|-xl|-2xl|-3xl)?$/,
    
    // Tables
    /^(border-(collapse|separate))$/,
    /^(table-(auto|fixed))$/,
    
    // Transitions & Animation
    /^(transition|transition-none|transition-all|transition-colors|transition-opacity|transition-shadow|transition-transform)$/,
    /^(duration)-(\d+)$/,
    /^(ease-(linear|in|out|in-out))$/,
    /^(delay)-(\d+)$/,
    /^(animate-(none|spin|ping|pulse|bounce))$/,
    
    // Transforms
    /^(transform|transform-cpu|transform-gpu|transform-none)$/,
    /^(scale|scale-x|scale-y)-(\d+)$/,
    /^(rotate)-(\d+)$/,
    /^(translate-x|translate-y)-(\d+|1\/2|1\/3|2\/3|1\/4|3\/4|full)$/,
    /^(skew-x|skew-y)-(\d+)$/,
    /^(origin-(center|top|top-right|right|bottom-right|bottom|bottom-left|left|top-left))$/,
    
    // Interactivity
    /^(appearance-none)$/,
    /^(cursor-(auto|default|pointer|wait|text|move|help|not-allowed|none|context-menu|progress|cell|crosshair|vertical-text|alias|copy|no-drop|grab|grabbing|all-scroll|col-resize|row-resize|n-resize|e-resize|s-resize|w-resize|ne-resize|nw-resize|se-resize|sw-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|zoom-in|zoom-out))$/,
    /^(pointer-events-(none|auto))$/,
    /^(resize(-none|-x|-y)?)$/,
    /^(select-(none|text|all|auto))$/,
    /^(user-select-(none|text|all|auto))$/,
    
    // SVG
    /^(fill-(none|current))$/,
    /^(stroke-(none|current))$/,
    /^(stroke)-(\d+)$/,
    
    // Accessibility
    /^(sr-only|not-sr-only)$/,
    
    // Responsive prefixes
    /^(sm|md|lg|xl|2xl):/,
    
    // State prefixes
    /^(hover|focus|focus-within|focus-visible|active|visited|target|first|last|odd|even|first-of-type|last-of-type|only-child|only-of-type|empty|disabled|enabled|checked|indeterminate|default|required|valid|invalid|in-range|out-of-range|placeholder-shown|autofill|read-only|before|after|first-letter|first-line|marker|selection|file|backdrop|placeholder):/,
    
    // Group and peer prefixes
    /^(group|peer)(-\w+)?:/,
    
    // Dark mode
    /^dark:/,
    
    // Print
    /^print:/,
    
    // Motion
    /^(motion-(safe|reduce)):/,
    
    // Arbitrary values (simplified check)
    /^\w+-\[.+\]$/,
    
    // Additional common patterns that might be missed
    /^(divide-x|divide-y)(-\d+|-(px|reverse))?$/,
    /^(divide)-(solid|dashed|dotted|double|none)$/,
    /^(order)-(\d+|first|last|none)$/,
    /^(basis)-(\d+|px|auto|full|1\/2|1\/3|2\/3|1\/4|2\/4|3\/4|1\/5|2\/5|3\/5|4\/5|1\/6|2\/6|3\/6|4\/6|5\/6|1\/12|2\/12|3\/12|4\/12|5\/12|6\/12|7\/12|8\/12|9\/12|10\/12|11\/12)$/,
    
    // Common Tailwind utilities
    /^(container|prose|antialiased|subpixel-antialiased|truncate|break-words|break-all|uppercase|lowercase|capitalize|normal-case|underline|overline|line-through|no-underline|tabular-nums|diagonal-fractions|oldstyle-nums|proportional-nums|slashed-zero|lining-nums)$/,
    
    // Background utilities
    /^(bg-(fixed|local|scroll))$/,
    /^(bg-(auto|cover|contain))$/,
    /^(bg-(center|top|right|bottom|left))$/,
    /^(bg-(repeat|no-repeat|repeat-x|repeat-y|repeat-round|repeat-space))$/,
    /^(bg-gradient-to-(t|tr|r|br|b|bl|l|tl))$/,
    /^(from|via|to)-(inherit|current|transparent|black|white)$/,
    /^(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    
    // Background clip utilities
    /^(bg-clip-(border|padding|content|text))$/,
    
    // Position
    /^(z)-(\d+|auto)$/,
    
    // Overflow
    /^(overflow|overflow-x|overflow-y)-(auto|hidden|clip|visible|scroll)$/,
    /^(overscroll|overscroll-x|overscroll-y)-(auto|contain|none)$/,
    
    // Display utilities
    /^(box-(border|content))$/,
    
    // Float
    /^(float-(right|left|none))$/,
    /^(clear-(left|right|both|none))$/,
    
    // Object fit
    /^(object-(contain|cover|fill|none|scale-down))$/,
    /^(object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top))$/,
    
    // List style
    /^(list-(none|disc|decimal))$/,
    /^(list-(inside|outside))$/
  ];
  
  return tailwindPatterns;
}

// Check if a class matches Tailwind patterns
function isTailwindClass(className, tailwindPatterns) {
  return tailwindPatterns.some(pattern => pattern.test(className));
}

// Extract class names from JSX/TSX files
function extractUsedClasses() {
  const usedClasses = new Map(); // className -> [files using it]
  
  try {
    const files = glob.sync('src/**/*.{tsx,jsx,ts,js}');
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Match className="..." and className='...' (avoid complex template literals)
      const classNameRegex = /className\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
      let match;
      
      while ((match = classNameRegex.exec(content)) !== null) {
        const classString = match[1] || match[2];
        if (!classString) continue;
        
        // Split by spaces to get individual classes
        const classes = classString.split(/\s+/).filter(Boolean);
        
        for (const className of classes) {
          // Skip conditional classes and template literals
          if (className.includes('${') || className.includes('?') || className.includes(':') || 
              className.includes('{') || className.includes('}') || className.includes('(') || 
              className.includes(')') || className.includes(',') || className.includes('=')) {
            continue;
          }
          
          // Clean up class name
          const cleanClassName = className.trim();
          if (!cleanClassName || cleanClassName.length < 2) continue;
          
          // Skip invalid class names (contain special characters)
          if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(cleanClassName)) continue;
          
          if (!usedClasses.has(cleanClassName)) {
            usedClasses.set(cleanClassName, []);
          }
          usedClasses.get(cleanClassName).push(file);
        }
      }
    }
    
    console.log(`${colors.cyan}Found ${usedClasses.size} unique classes used in components${colors.reset}`);
    return usedClasses;
  } catch (error) {
    console.error(`${colors.red}Error reading component files: ${error.message}${colors.reset}`);
    return new Map();
  }
}

// Main function
function checkCSSClasses() {
  console.log(`${colors.cyan}🔍 Checking for undefined CSS classes...${colors.reset}\n`);
  
  const definedClasses = extractCSSClasses();
  const usedClasses = extractUsedClasses();
  const tailwindPatterns = getTailwindClasses();
  
  const undefinedClasses = [];
  
  for (const [className, files] of usedClasses) {
    // Skip if class is defined in CSS
    if (definedClasses.has(className)) continue;
    
    // Skip if it's a Tailwind class
    if (isTailwindClass(className, tailwindPatterns)) continue;
    
    // Skip CSS custom property classes (using your design system)
    const customPropertyClasses = [
      /^(bg|text|border|ring|fill|stroke)-(background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring|sidebar|sidebar-foreground|sidebar-primary|sidebar-primary-foreground|sidebar-accent|sidebar-accent-foreground|sidebar-border|sidebar-ring)$/,
      /^ring-offset-(background|foreground)$/
    ];
    
    if (customPropertyClasses.some(pattern => pattern.test(className))) continue;
    
    // Skip common utility classes that might be defined elsewhere
    const skipPatterns = [
      /^sr-only$/,
      /^not-sr-only$/,
      /^group$/,
      /^peer$/,
      /^animate-/,
      /^dark:/,
      /^light:/,
      /^container$/,
      /^prose$/,
      /^toaster$/, // Sonner toaster class
      /^\w+:\w+$/, // Skip state prefixes like hover:bg-blue-500
      /^(sm|md|lg|xl|2xl):\w+$/, // Skip responsive prefixes
    ];
    
    if (skipPatterns.some(pattern => pattern.test(className))) continue;
    
    undefinedClasses.push({ className, files });
  }
  
  // Report results
  if (undefinedClasses.length > 0) {
    console.error(`${colors.red}❌ Found ${undefinedClasses.length} undefined CSS classes:${colors.reset}\n`);
    
    for (const { className, files } of undefinedClasses) {
      console.error(`${colors.red}   .${className}${colors.reset}`);
      const uniqueFiles = [...new Set(files)];
      for (const file of uniqueFiles.slice(0, 3)) { // Show max 3 files
        console.error(`${colors.yellow}     used in: ${file}${colors.reset}`);
      }
      if (uniqueFiles.length > 3) {
        console.error(`${colors.yellow}     ...and ${uniqueFiles.length - 3} more files${colors.reset}`);
      }
      console.error('');
    }
    
    console.error(`${colors.red}Add these classes to src/index.css or verify they are correct Tailwind classes${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ All CSS classes are properly defined${colors.reset}`);
  }
}

// Run the check
checkCSSClasses();