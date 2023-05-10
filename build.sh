#!/bin/bash
set -e
echo "Starting install npm packages..."
npm install -g pnpm
echo "Cloning Blogs..."
git clone -b new_blog https://${GH_TOKEN}@github.com/WincerChan/BlogContent _blogs
pnpm i
echo "hugo Building..."
pnpm dev:hugo
echo "Create sitemap index..."
directories=("posts" "category" "tags" "base" "")
for dir in "${directories[@]}"; do
    mkdir -p "public/${dir}"
    cp "_output/${dir}/sitemap.xml" "public/${dir}/sitemap.xml"
done
mv "_output/sass" "public/"
echo "Next build"
pnpm build