#!/bin/bash
YELLOW='\033[0;33m'
RESET='\033[0m'
set -e
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing pnpm...${RESET}"
    npm install -g pnpm
fi
echo -e "${YELLOW}Installing dependencies...${RESET}"
pnpm i
if [ ! -d "_blogs" ]; then
    echo -e "${YELLOW}Cloning Blogs...${RESET}"
    git clone -b new_blog https://${GH_TOKEN}@github.com/WincerChan/BlogContent _blogs
fi
echo -e "${YELLOW}Building hugo content...${RESET}"
pnpm dev:hugo
echo -e "${YELLOW}Creating sitemap index...${RESET}"
directories=("posts" "category" "tags" "base" "")
for dir in "${directories[@]}"; do
    mkdir -p "public/${dir}"
    cp "_output/${dir}/sitemap.xml" "public/${dir}/sitemap.xml"
done
cp -r "_output/sass" "public/"
cp -r "_output/manifest.webmanifest" "public/"
echo -e "${YELLOW}Building site...${RESET}"
pnpm build

if [ "$1" == "--hitcache" ]; then
    echo -e "${YELLOW}String hit cache...${RESET}"
    ./hit-cache.cjs
    exit
fi

if [ "$1" == "--publish" ]; then
    echo -e "${YELLOW}Cleaning old assets...${RESET}"
    rm -rf _blogs/wir/assets/
    echo -e "${YELLOW}Copy new assets...${RESET}"
    cp -r dist/public/assets _blogs/wir/
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