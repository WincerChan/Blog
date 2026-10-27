import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const directory = resolve('experiments/astro-og-takumi');
const output = `${directory}/output`;
const manifest = JSON.parse(await readFile(`${output}/baseline/manifest.json`, 'utf8'));
const files = (await readdir(`${output}/baseline`)).filter(file => file.endsWith('.png')).sort();
assert.equal(files.length, manifest.length, 'Stale image files; use fresh output directories');
for (const engine of ['takumi', 'takumi-sharp']) {
  assert.deepEqual((await readdir(`${output}/${engine}`)).filter(file => file.endsWith('.png')).sort(), files);
  assert.deepEqual(JSON.parse(await readFile(`${output}/${engine}/manifest.json`, 'utf8')), manifest);
}
const results = [];
const decode = file => sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
function textBands(data, width) {
  const bands = [];
  for (let y = 205; y < 725; y++) {
    let pixels = 0;
    for (let x = 120; x < 1700; x++) {
      const index = (y * width + x) * 4;
      if (data[index] < 170 && data[index + 1] < 180 && data[index + 2] < 190) pixels++;
    }
    if (pixels > 8) {
      const last = bands.at(-1);
      if (last && y - last[1] <= 7) last[1] = y;
      else bands.push([y, y]);
    }
  }
  return bands;
}
for (const item of manifest) {
  const [baseline, takumi, encoded] = await Promise.all(['baseline', 'takumi', 'takumi-sharp']
    .map(engine => decode(`${output}/${engine}/${item.index}.png`)));
  for (const image of [baseline, takumi, encoded]) {
    assert.equal(image.info.width, 1800);
    assert.equal(image.info.height, 945);
    assert.equal(image.info.channels, 4);
  }
  assert(takumi.data.equals(encoded.data), `Takumi PNG/raw+Sharp pixels differ for ${item.index}`);
  let absoluteError = 0, changedPixels = 0, alphaMismatch = 0;
  for (let index = 0; index < baseline.data.length; index += 4) {
    let maxDifference = 0;
    for (let channel = 0; channel < 3; channel++) {
      const delta = Math.abs(baseline.data[index + channel] - takumi.data[index + channel]);
      absoluteError += delta;
      maxDifference = Math.max(maxDifference, delta);
    }
    if (maxDifference > 16) changedPixels++;
    if (baseline.data[index + 3] !== takumi.data[index + 3]) alphaMismatch++;
  }
  results.push({ index: item.index, slug: item.slug,
    meanAbsoluteRgbError: absoluteError / (1800 * 945 * 3),
    changedPixelFractionAbove16: changedPixels / (1800 * 945), alphaMismatch,
    baselineTextBands: textBands(baseline.data, 1800), takumiTextBands: textBands(takumi.data, 1800),
  });
}

// Include the largest difference plus Chinese, English, home and category cards.
const worst = results.toSorted((a, b) => b.meanAbsoluteRgbError - a.meanAbsoluteRgbError)[0].index;
const english = manifest.filter(item => item.input.titleFontFamily.startsWith('Fraunces'));
const longestEnglish = english.toSorted((a, b) => b.input.title.length - a.input.title.length)[0];
const longestChinese = manifest.filter(item => !item.input.titleFontFamily.startsWith('Fraunces'))
  .toSorted((a, b) => b.input.title.length - a.input.title.length)[0];
const selected = [...new Set([0, longestChinese.index, longestEnglish.index, worst,
  manifest.find(item => item.slug === 'page/index').index,
  manifest.find(item => item.slug.startsWith('page/category/')).index])];
const cellWidth = 720, cellHeight = 378, labelHeight = 32, margin = 16;
const canvasWidth = cellWidth * 2 + margin * 3;
const canvasHeight = margin + selected.length * (labelHeight + cellHeight + margin);
const composites = [];
for (const [row, index] of selected.entries()) {
  const top = margin + row * (labelHeight + cellHeight + margin);
  const label = `<svg width="${canvasWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><text x="16" y="22" font-family="sans-serif" font-size="18" fill="#17202b">#${index}  Satori + resvg + Sharp</text><text x="${cellWidth + margin * 2}" y="22" font-family="sans-serif" font-size="18" fill="#17202b">Takumi 2.18.1</text></svg>`;
  composites.push({ input: Buffer.from(label), top, left: 0 });
  for (const [column, engine] of ['baseline', 'takumi'].entries()) {
    composites.push({ input: await sharp(`${output}/${engine}/${index}.png`).resize(cellWidth, cellHeight).png().toBuffer(),
      top: top + labelHeight, left: margin + column * (cellWidth + margin) });
  }
}
await sharp({ create: { width: canvasWidth, height: canvasHeight, channels: 4, background: '#e8ecef' } })
  .composite(composites).png().toFile(`${directory}/comparison.png`);
const previewRows = [...new Set([0, selected.indexOf(worst)])];
const rowHeight = labelHeight + cellHeight + margin;
const previews = [];
for (const [index, row] of previewRows.entries()) {
  previews.push({ input: await sharp(`${directory}/comparison.png`)
    .extract({ left: 0, top: margin + row * rowHeight, width: canvasWidth, height: rowHeight })
    .png().toBuffer(), left: 0, top: index * rowHeight });
}
await sharp({ create: { width: canvasWidth, height: previewRows.length * rowHeight, channels: 4, background: '#e8ecef' } })
  .composite(previews).png().toFile(`${directory}/preview.png`);
const sorted = results.toSorted((a, b) => a.meanAbsoluteRgbError - b.meanAbsoluteRgbError);
const report = { count: results.length, dimensions: [1800, 945],
  takumiPngEqualsRawSharpPixels: true,
  medianMeanAbsoluteRgbError: sorted[Math.floor(sorted.length / 2)].meanAbsoluteRgbError,
  maxMeanAbsoluteRgbError: sorted.at(-1).meanAbsoluteRgbError,
  textBandCountDifferences: results.filter(item => item.baselineTextBands.length !== item.takumiTextBands.length),
  selected: selected.map(index => manifest[index]), results };
await writeFile(`${directory}/comparison.json`, JSON.stringify(report, null, 2) + '\n');
const { results: details, selected: cards, ...summary } = report;
console.log(JSON.stringify({ ...summary, selected: cards.map(card => ({ index: card.index, title: card.input.title })) }, null, 2));
