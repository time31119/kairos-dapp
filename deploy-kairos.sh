#!/bin/bash
set -e

cd /home/ec2-user/kairos-dapp

# Pull latest code
git pull origin main

# Export web bundle
cd client && npx expo export --platform web && cd ..

# Copy manifest.json to dist folder
cp client/public/manifest.json client/dist/manifest.json

# Build server
cd server && pnpm run build && cd ..

# Backup old server dist and copy new files
mkdir -p server/dist_backup
cp server/dist/index.js server/dist_backup/
rm -rf server/dist/*
cp -r client/dist/* server/dist/
cp server/dist_backup/index.js server/dist/

# Restart server
pkill -f "node server" 2>/dev/null || true
sleep 1
nohup node server/dist/index.js > /tmp/kairos.log 2>&1 &

echo "Deployment completed successfully!"
