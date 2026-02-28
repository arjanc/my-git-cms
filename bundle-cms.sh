#!/bin/bash

set -e

echo "🔨 Building Git CMS package..."

# Build the CMS package (clean first so deleted source files don't linger in dist/)
cd packages/git-cms
npm install
rm -rf dist/
npm run build

echo "📦 Bundling into app..."

# Copy to app/lib (clean first so stale compiled files don't accumulate)
cd ../../example-app
mkdir -p lib/git-cms
rm -rf lib/git-cms/dist

# Copy built files
cp -r ../packages/git-cms/dist lib/git-cms/
cp ../packages/git-cms/package.json lib/git-cms/

echo "✅ CMS package bundled successfully!"
echo ""
echo "Next steps:"
echo "1. cd example-app"
echo "2. npm install"
echo "3. git add lib/"
echo "4. git commit -m 'Bundle CMS package'"
echo "5. git push"
echo "6. vercel"
