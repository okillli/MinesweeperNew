#!/usr/bin/env node

/**
 * analyze-dependencies.js
 *
 * Lightweight dependency analysis script for MineQuest
 * Analyzes JavaScript files and generates a dependency report
 *
 * Usage:
 *   node analyze-dependencies.js
 *
 * No external dependencies required (vanilla Node.js)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const OUTPUT_FILE = path.join(__dirname, 'dependency-report.txt');

// Dependency storage
const dependencies = new Map();
const allFiles = [];

/**
 * Recursively finds all .js files in a directory
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extracts class/function names and dependencies from a file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(__dirname, filePath);

  const analysis = {
    path: relativePath,
    imports: [],
    exports: [],
    classNames: [],
    functionNames: [],
    usages: []
  };

  // Find class definitions
  const classMatches = content.matchAll(/class\s+(\w+)/g);
  for (const match of classMatches) {
    analysis.classNames.push(match[1]);
    analysis.exports.push(match[1]);
  }

  // Find function definitions
  const funcMatches = content.matchAll(/function\s+(\w+)/g);
  for (const match of funcMatches) {
    analysis.functionNames.push(match[1]);
  }

  // Find explicit module.exports
  const exportMatches = content.matchAll(/module\.exports\s*=\s*(\w+)/g);
  for (const match of exportMatches) {
    if (!analysis.exports.includes(match[1])) {
      analysis.exports.push(match[1]);
    }
  }

  // Find class/function usages (new ClassName or ClassName())
  const allExportedNames = [...new Set([
    'Cell', 'Grid', 'Game', 'GameState', 'EventBus', 'CanvasRenderer',
    'UIRenderer', 'ShopSystem', 'ItemSystem', 'SaveSystem'
  ])];

  allExportedNames.forEach(name => {
    // Check for 'new ClassName' or 'ClassName(' usage
    const newRegex = new RegExp(`new\\s+${name}\\s*\\(`, 'g');
    const callRegex = new RegExp(`[^\\w]${name}\\s*\\(`, 'g');

    if (newRegex.test(content) || callRegex.test(content)) {
      // Don't count self-references
      if (!analysis.exports.includes(name)) {
        analysis.usages.push(name);
      }
    }
  });

  return analysis;
}

/**
 * Builds the dependency graph
 */
function buildDependencyGraph() {
  const files = findJSFiles(SRC_DIR);

  files.forEach(file => {
    const analysis = analyzeFile(file);
    allFiles.push(analysis);

    // Store by exported names
    analysis.exports.forEach(exportName => {
      dependencies.set(exportName, analysis);
    });
  });
}

/**
 * Finds all files that depend on a given export
 */
function findDependents(exportName) {
  const dependents = [];

  allFiles.forEach(file => {
    if (file.usages.includes(exportName)) {
      dependents.push(file.path);
    }
  });

  return dependents;
}

/**
 * Calculates a risk score for a component
 */
function calculateRiskScore(exportName) {
  const dependents = findDependents(exportName);
  const dependentCount = dependents.length;

  // Simple risk scoring
  // More dependents = higher risk
  if (dependentCount >= 4) return 'CRITICAL';
  if (dependentCount >= 2) return 'HIGH';
  if (dependentCount === 1) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generates the dependency report
 */
function generateReport() {
  let report = '';

  report += '='.repeat(80) + '\n';
  report += 'DEPENDENCY ANALYSIS REPORT\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += '='.repeat(80) + '\n\n';

  // Component Summary
  report += 'COMPONENT SUMMARY\n';
  report += '-'.repeat(80) + '\n';

  const exportNames = Array.from(dependencies.keys()).sort();

  exportNames.forEach(name => {
    const analysis = dependencies.get(name);
    const dependents = findDependents(name);
    const risk = calculateRiskScore(name);

    report += `\n${name}\n`;
    report += `  File: ${analysis.path}\n`;
    report += `  Risk Level: ${risk}\n`;
    report += `  Depends On: ${analysis.usages.length > 0 ? analysis.usages.join(', ') : 'None'}\n`;
    report += `  Used By (${dependents.length}): ${dependents.length > 0 ? '\n    - ' + dependents.join('\n    - ') : 'None'}\n`;
  });

  // Dependency Tree
  report += '\n\n' + '='.repeat(80) + '\n';
  report += 'DEPENDENCY TREE\n';
  report += '-'.repeat(80) + '\n\n';

  exportNames.forEach(name => {
    const analysis = dependencies.get(name);
    report += `${name}\n`;

    if (analysis.usages.length > 0) {
      analysis.usages.forEach(dep => {
        report += `  ↑ depends on ${dep}\n`;
      });
    }

    const dependents = findDependents(name);
    if (dependents.length > 0) {
      dependents.forEach(dep => {
        const fileName = path.basename(dep, '.js');
        report += `  ↓ used by ${fileName}\n`;
      });
    }

    if (analysis.usages.length === 0 && dependents.length === 0) {
      report += `  (no dependencies)\n`;
    }

    report += '\n';
  });

  // Risk Analysis
  report += '\n' + '='.repeat(80) + '\n';
  report += 'RISK ANALYSIS\n';
  report += '-'.repeat(80) + '\n\n';

  const critical = exportNames.filter(n => calculateRiskScore(n) === 'CRITICAL');
  const high = exportNames.filter(n => calculateRiskScore(n) === 'HIGH');
  const medium = exportNames.filter(n => calculateRiskScore(n) === 'MEDIUM');
  const low = exportNames.filter(n => calculateRiskScore(n) === 'LOW');

  report += `CRITICAL (4+ dependents): ${critical.length}\n`;
  if (critical.length > 0) {
    critical.forEach(name => {
      report += `  - ${name} (${findDependents(name).length} dependents)\n`;
    });
  }

  report += `\nHIGH (2-3 dependents): ${high.length}\n`;
  if (high.length > 0) {
    high.forEach(name => {
      report += `  - ${name} (${findDependents(name).length} dependents)\n`;
    });
  }

  report += `\nMEDIUM (1 dependent): ${medium.length}\n`;
  if (medium.length > 0) {
    medium.forEach(name => {
      report += `  - ${name} (${findDependents(name).length} dependents)\n`;
    });
  }

  report += `\nLOW (0 dependents): ${low.length}\n`;
  if (low.length > 0) {
    low.forEach(name => {
      report += `  - ${name} (${findDependents(name).length} dependents)\n`;
    });
  }

  // Circular Dependency Check
  report += '\n\n' + '='.repeat(80) + '\n';
  report += 'CIRCULAR DEPENDENCY CHECK\n';
  report += '-'.repeat(80) + '\n\n';

  let circularFound = false;
  exportNames.forEach(name => {
    const analysis = dependencies.get(name);
    analysis.usages.forEach(dep => {
      const depAnalysis = dependencies.get(dep);
      if (depAnalysis && depAnalysis.usages.includes(name)) {
        report += `⚠️  CIRCULAR: ${name} ↔ ${dep}\n`;
        circularFound = true;
      }
    });
  });

  if (!circularFound) {
    report += '✅ No circular dependencies detected\n';
  }

  // Orphan Check
  report += '\n' + '='.repeat(80) + '\n';
  report += 'ORPHAN CHECK\n';
  report += '-'.repeat(80) + '\n\n';

  const orphans = exportNames.filter(name => {
    const dependents = findDependents(name);
    return dependents.length === 0;
  });

  if (orphans.length > 0) {
    report += '⚠️  Components with no dependents (potentially unused):\n';
    orphans.forEach(name => {
      report += `  - ${name}\n`;
    });
  } else {
    report += '✅ All components are used\n';
  }

  // Statistics
  report += '\n' + '='.repeat(80) + '\n';
  report += 'STATISTICS\n';
  report += '-'.repeat(80) + '\n\n';

  report += `Total Files Analyzed: ${allFiles.length}\n`;
  report += `Total Components: ${exportNames.length}\n`;
  report += `Average Dependents per Component: ${(exportNames.reduce((sum, name) => sum + findDependents(name).length, 0) / exportNames.length).toFixed(2)}\n`;
  report += `Most Depended Upon: ${exportNames.reduce((max, name) => {
    const count = findDependents(name).length;
    return count > findDependents(max).length ? name : max;
  }, exportNames[0])} (${findDependents(exportNames.reduce((max, name) => {
    const count = findDependents(name).length;
    return count > findDependents(max).length ? name : max;
  }, exportNames[0])).length} dependents)\n`;

  report += '\n' + '='.repeat(80) + '\n';
  report += 'END OF REPORT\n';
  report += '='.repeat(80) + '\n';

  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('Analyzing dependencies...\n');

  try {
    buildDependencyGraph();
    const report = generateReport();

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, report);

    console.log('✅ Dependency analysis complete!');
    console.log(`📄 Report saved to: ${OUTPUT_FILE}\n`);

    // Print summary to console
    const exportNames = Array.from(dependencies.keys());
    const critical = exportNames.filter(n => calculateRiskScore(n) === 'CRITICAL');

    console.log('SUMMARY:');
    console.log(`  Total Components: ${exportNames.length}`);
    console.log(`  Critical Components: ${critical.length}`);

    if (critical.length > 0) {
      console.log('\n⚠️  CRITICAL COMPONENTS (4+ dependents):');
      critical.forEach(name => {
        console.log(`  - ${name} (${findDependents(name).length} dependents)`);
      });
    }

    console.log('\n💡 Run "type dependency-report.txt" to view full report');
    console.log('💡 For visual graph, install madge: npm install -D madge && npm run deps\n');

  } catch (error) {
    console.error('❌ Error analyzing dependencies:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, buildDependencyGraph, findDependents, calculateRiskScore };
