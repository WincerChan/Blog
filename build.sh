#!/bin/bash
set -e
echo "Starting install npm packages..."
npm install -g pnpm
pnpm i
echo "hugo Building..."
echo "Next build"
pnpm build

