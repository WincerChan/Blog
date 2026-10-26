#!/bin/bash
YELLOW='\033[0;33m'
RESET='\033[0m'
export LANG=en_US.UTF-8
set -e
case "${1:-}" in
    ""|--publish) ;;
    *) echo "Usage: $0 [--publish]" >&2; exit 1 ;;
esac
echo -e "${YELLOW}Installing dependencies...${RESET}"
if ! command -v bun >/dev/null 2>&1; then
    echo -e "${YELLOW}bun not found, please install bun first.${RESET}"
    exit 1
fi
bun install --frozen-lockfile
if [ ! -d "_blogs" ]; then
    echo -e "${YELLOW}Cloning Blogs...${RESET}"
    git clone https://${GH_TOKEN}@github.com/WincerChan/BlogContent _blogs
else
    echo -e "${YELLOW}Updating Blogs...${RESET}"
    cd _blogs
    git pull
    cd ..
fi
echo -e "${YELLOW}Building site...${RESET}"
bun run build

mkdir -p dist
rm -rf dist/public
mkdir -p dist/public
cp -r dist/astro/. dist/public/

if [ "$1" == "--publish" ]; then
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${YELLOW}jq not found, please install it first.${RESET}"
        exit
    fi
    if [ ! -f "_blogs/wir/package.json" ]; then
        echo -e "${YELLOW}_blogs/wir/package.json not found, cannot bump version.${RESET}"
        exit 1
    fi
    CURR_WIR_VERSION=$(jq -r '.version' _blogs/wir/package.json)
    BASE_VERSION=${CURR_WIR_VERSION%%-*}
    IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE_VERSION"
    if ! [[ "$MAJOR" =~ ^[0-9]+$ && "$MINOR" =~ ^[0-9]+$ && "$PATCH" =~ ^[0-9]+$ ]]; then
        echo -e "${YELLOW}Invalid semver in _blogs/wir/package.json: $CURR_WIR_VERSION${RESET}"
        exit 1
    fi
    NEXT_WIR_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
    echo -e "${YELLOW}Bumping wir version: ${CURR_WIR_VERSION} -> ${NEXT_WIR_VERSION}${RESET}"
    jq --arg nv "$NEXT_WIR_VERSION" '.version = $nv' _blogs/wir/package.json > _blogs/wir/.package.json && mv _blogs/wir/.package.json _blogs/wir/package.json

    echo -e "${YELLOW}Cleaning old assets...${RESET}"
    rm -rf _blogs/wir/assets/ _blogs/wir/_astro/
    echo -e "${YELLOW}Cleaning old _data...${RESET}"
    rm -rf _blogs/wir/_data/
    echo -e "${YELLOW}Copy new assets...${RESET}"
    cp -r dist/astro/_astro _blogs/wir/
    cd _blogs/wir
    NEW_VERSION=$(jq -r '.version' package.json)
    echo -e "${YELLOW}Publishing new version ${NEW_VERSION}...${RESET}"
    npm publish --otp=$(read -p "Enter OTP: " otp; echo $otp)
fi
