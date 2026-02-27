#!/bin/bash

set -e

echo "🔨 Building Git CMS package..."

# Build the CMS package
cd packages/git-cms
npm install
npm run build

echo "📦 Bundling into app..."

# Copy to app/lib
cd ../../example-app
mkdir -p lib/git-cms

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
