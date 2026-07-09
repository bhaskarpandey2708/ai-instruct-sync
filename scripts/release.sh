#!/usr/bin/env bash
set -e

echo "=== Building ==="
cd instruct-sync
rm -rf dist
npm run build
npm test

echo "=== Bumping version (patch) ==="
npm version patch

echo "=== Publishing to npm (beta tag) ==="
npm publish --access public --tag beta

echo "=== Tagging and pushing (you may need to push manually) ==="
cd ..
git add .
git commit -m "chore: release instruct-sync v$(node -p "require('./instruct-sync/package.json').version")" || true
git tag -a "v$(node -p "require('./instruct-sync/package.json').version")" -m "Release" || true

echo "Done. Now run:"
echo "  git push origin main --tags"
echo "  (and create GitHub Release from the tag)"
