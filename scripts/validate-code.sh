#!/bin/bash
# Automated code validation script
# Run before every commit to ensure code quality

echo "🔍 Running automated code validation..."
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to report error
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to report warning
warn() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to report success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo "1️⃣  Checking JavaScript syntax..."
# Check all JS files for syntax errors
for file in src/**/*.js; do
    if [ -f "$file" ]; then
        # Use Node.js to check syntax
        node --check "$file" 2>/dev/null
        if [ $? -ne 0 ]; then
            error "Syntax error in $file"
        fi
    fi
done

if [ $ERRORS -eq 0 ]; then
    success "JavaScript syntax valid"
fi
echo ""

echo "2️⃣  Checking for console.log statements..."
# Find console.log that aren't marked as intentional
CONSOLE_LOGS=$(grep -r "console\.log" src/ --exclude-dir=node_modules | grep -v "// intentional" | grep -v "console.error")

if [ ! -z "$CONSOLE_LOGS" ]; then
    warn "console.log found (mark as '// intentional' if needed):"
    echo "$CONSOLE_LOGS"
else
    success "No unintentional console.log found"
fi
echo ""

echo "3️⃣  Checking for TODOs without phase reference..."
# Find TODOs that don't reference a phase
TODOS=$(grep -r "TODO" src/ | grep -v "TODO(Phase" | grep -v "// TODO:" | grep -v "node_modules")

if [ ! -z "$TODOS" ]; then
    warn "TODO comments without phase reference found:"
    echo "$TODOS"
    echo "  Tip: Use 'TODO(Phase X):' format"
else
    success "All TODOs properly formatted"
fi
echo ""

echo "4️⃣  Checking for debugger statements..."
# Find debugger statements (should never be committed)
DEBUGGERS=$(grep -r "debugger" src/ --exclude-dir=node_modules)

if [ ! -z "$DEBUGGERS" ]; then
    error "debugger statements found (remove before commit):"
    echo "$DEBUGGERS"
else
    success "No debugger statements found"
fi
echo ""

echo "5️⃣  Checking file structure..."
# Verify expected directories exist
EXPECTED_DIRS=("src/core" "src/entities" "src/rendering" "scripts")

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        error "Expected directory missing: $dir"
    fi
done

if [ $ERRORS -eq 0 ]; then
    success "File structure valid"
fi
echo ""

echo "6️⃣  Checking for large files..."
# Warn about files larger than 500 lines
LARGE_FILES=$(find src/ -name "*.js" -exec wc -l {} + | awk '$1 > 500 {print $2 " (" $1 " lines)"}')

if [ ! -z "$LARGE_FILES" ]; then
    warn "Large files found (consider refactoring if > 500 lines):"
    echo "$LARGE_FILES"
else
    success "No oversized files"
fi
echo ""

echo "7️⃣  Checking for commented-out code..."
# Find blocks of commented code (likely dead code)
COMMENTED=$(grep -r "^[[:space:]]*//[[:space:]]*[a-zA-Z]" src/ --exclude-dir=node_modules | wc -l)

if [ $COMMENTED -gt 50 ]; then
    warn "Large amount of commented code found ($COMMENTED lines)"
    echo "  Tip: Delete unused code (git remembers history)"
else
    success "Commented code within acceptable range"
fi
echo ""

# Summary
echo "═══════════════════════════════════════"
echo "VALIDATION SUMMARY"
echo "═══════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Ready to commit ✨"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
    echo ""
    echo "Warnings found, but you can proceed."
    echo "Consider fixing warnings before commit."
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s), $WARNINGS warning(s)${NC}"
    echo ""
    echo "FIX ERRORS BEFORE COMMITTING!"
    exit 1
fi
