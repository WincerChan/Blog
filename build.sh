#!/bin/bash
YELLOW='\033[0;33m'
RESET='\033[0m'
export LANG=en_US.UTF-8
set -e
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing pnpm...${RESET}"
    npm install -g pnpm@9.12.2
fi
pnpm clean
echo -e "${YELLOW}Installing dependencies...${RESET}"
pnpm install --no-frozen-lockfile
if [ ! -d "_blogs" ]; then
    echo -e "${YELLOW}Cloning Blogs...${RESET}"
    git clone -b new_blog https://${GH_TOKEN}@github.com/WincerChan/BlogContent _blogs
else
    echo -e "${YELLOW}Updating Blogs...${RESET}"
    cd _blogs
    git pull
    cd ..
fi
echo -e "${YELLOW}Building content (velite)...${RESET}"
pnpm dev:content
echo -e "${YELLOW}Building site...${RESET}"
pnpm build

if [ "$1" == "--hitcache" ]; then
    echo -e "${YELLOW}String hit cache...${RESET}"
    ./hit-cache.cjs
    exit
fi
mkdir -p dist
cp -r .output/public dist/
cp dist/public/404/index.html dist/public/404.html

if [ "$1" == "--publish" ]; then
    echo -e "${YELLOW}Cleaning old assets...${RESET}"
    rm -rf _blogs/wir/assets/
    echo -e "${YELLOW}Copy new assets...${RESET}"
    cp -r .output/public/_build/assets _blogs/wir/
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${YELLOW}jq not found, please install it first.${RESET}"
        exit
    fi
    . .env
    cd _blogs/wir
    echo -e "${YELLOW}Publishing new version $VITE_ASSET_VERSION...${RESET}"
    jq --arg nv "$VITE_ASSET_VERSION" '.version = $nv' package.json > .package.json && mv .package.json package.json
    npm publish --otp=$(read -p "Enter OTP: " otp; echo $otp)
fi
