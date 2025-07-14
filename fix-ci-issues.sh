#!/bin/bash

echo "🔧 Fixing CI/CD Issues..."

# Install prettier if not already installed
echo "📦 Installing prettier..."
npm install prettier --save-dev

# Format all files with prettier
echo "✨ Running prettier to fix formatting..."
npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,md}"

# Run ESLint to check for remaining issues
echo "🔍 Running ESLint..."
npm run lint

# Run build to check for any build issues
echo "🏗️ Testing build..."
npm run build

echo "✅ All fixes applied! Ready to commit and push."