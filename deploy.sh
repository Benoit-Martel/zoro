#!/bin/bash

# Build and upload script for Zorodateur

echo "📦 Building..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "🚀 Uploading to server..."
bash .upload

echo ""
echo "✅ Deploy complete!"
