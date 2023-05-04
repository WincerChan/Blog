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
mkdir -p public/{posts, category, tags, base}
cp _output/posts/sitemap.xml public/posts/sitemap.xml
cp _output/category/sitemap.xml public/category/sitemap.xml
cp _output/tags/sitemap.xml public/tags/sitemap.xml
cp _output/base/sitemap.xml public/base/sitemap.xml
echo "Next build"
pnpm build
cd dist/public/category

for file in *; do
  # 对文件名进行 URI 解码
  decoded_file_name=$(printf "$(basename "$file" | sed 's@+@ @g;s@%@\\x@g')")

  # 如果解码后的文件名与原文件名不同，则重命名文件
  if [ "$file" != "$decoded_file_name" ]; then
    mv "$file" "$decoded_file_name"
  fi
done
cd ../tags
for file in *; do
  # 对文件名进行 URI 解码
  decoded_file_name=$(printf "$(basename "$file" | sed 's@+@ @g;s@%@\\x@g')")

  # 如果解码后的文件名与原文件名不同，则重命名文件
  if [ "$file" != "$decoded_file_name" ]; then
    mv "$file" "$decoded_file_name"
  fi
done