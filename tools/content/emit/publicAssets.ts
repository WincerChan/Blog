import fs from "node:fs/promises";
import path from "node:path";
import png2icons from "png2icons";
import type { SiteConf } from "../site";
import { writeFile } from "../io";
import { renderPng } from "../og/resvg";

const ATOM_CSS =
  `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;max-width:860px;margin:2rem auto;line-height:1.6;padding:0 1rem;color:#111}a{color:#065279;text-decoration:none}img{max-width:100%}pre{white-space:pre-wrap}\n`;

const SITEMAP_CSS =
  `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;max-width:920px;margin:2rem auto;line-height:1.6;padding:0 1rem;color:#111;background:#fff}a{color:#065279;text-decoration:none}a:hover{text-decoration:underline}.container{max-width:920px;margin:0 auto}.desc{margin:.25rem 0 1rem}.muted{color:#666}.toolbar{display:flex;gap:.75rem;align-items:center;justify-content:space-between;margin:1rem 0 0}.filter{flex:1;min-width:12rem;max-width:34rem;padding:.6rem .75rem;border:1px solid rgba(0,0,0,.15);border-radius:.6rem;font-size:14px}.count{white-space:nowrap;color:#666;font-size:14px}.table{width:100%;border-collapse:collapse;margin:1rem 0 2rem}.table thead th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#555;border-bottom:1px solid rgba(0,0,0,.15);padding:.65rem .5rem;text-align:left}.table tbody td{font-size:13px;padding:.55rem .5rem;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:top}.table tbody tr:hover td{background:rgba(0,0,0,.02)}.nowrap{white-space:nowrap}.url{word-break:break-all}@media (max-width:640px){.table thead th:nth-child(2),.table thead th:nth-child(3),.table thead th:nth-child(4),.table tbody td:nth-child(2),.table tbody td:nth-child(3),.table tbody td:nth-child(4){display:none}}@media (prefers-color-scheme:dark){body{color:#eaeaea;background:#0b0f14}a{color:#7dd3fc}.muted,.count{color:#9aa4b2}.filter{background:#0f1720;border-color:rgba(255,255,255,.14);color:#eaeaea}.table thead th{color:#aab3c2;border-bottom-color:rgba(255,255,255,.14)}.table tbody td{border-bottom-color:rgba(255,255,255,.08)}.table tbody tr:hover td{background:rgba(255,255,255,.03)}}\n`;

const emitFaviconAssets = async (publicDir: string) => {
  const sourceSvg = path.join(publicDir, "favicon", "light.svg");
  const svg = await fs.readFile(sourceSvg, "utf8");
  const generatedDir = path.join(publicDir, "favicon", "generated");
  await fs.mkdir(generatedDir, { recursive: true });

  const logoPng = await renderPng(svg, { width: 512 });
  const applePng = await renderPng(svg, { width: 180 });

  await fs.writeFile(path.join(generatedDir, "logo-512.png"), logoPng);
  await fs.writeFile(path.join(generatedDir, "apple-touch-icon.png"), applePng);

  const ico = png2icons.createICO(logoPng, png2icons.BILINEAR, 0, true);
  if (!ico) {
    throw new Error("Failed to generate favicon.ico from logo-512.png");
  }
  await fs.writeFile(path.join(publicDir, "favicon.ico"), ico);
};

export const emitPublicAssets = async ({
  site,
  publicDir,
}: {
  site: SiteConf;
  publicDir: string;
}) => {
  await emitFaviconAssets(publicDir);
  const manifest = {
    name: site.title,
    short_name: site.author || site.title,
    description: site.description,
    lang: "zh-CN",
    start_url: "/",
    display: "fullscreen",
    orientation: "natural",
    theme_color: "#fdfdfc",
    background_color: "#fdfdfc",
    icons: [
      {
        src: "/favicon/light.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon/generated/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/generated/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };

  await writeFile(
    path.join(publicDir, "manifest.webmanifest"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  await writeFile(path.join(publicDir, "sass", "atom.css"), ATOM_CSS);
  await writeFile(path.join(publicDir, "sass", "sitemap.css"), SITEMAP_CSS);
};
