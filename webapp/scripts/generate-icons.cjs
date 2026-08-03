// Regenerate the PWA/touch icons from public/favicon.svg.
// The committed PNGs were produced by a rasteriser that dropped the gradient
// fill and the stroked clock hands, leaving a black disc. libvips (via sharp)
// renders both correctly.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUB = path.join(process.cwd(), 'public');
const svg = fs.readFileSync(path.join(PUB, 'favicon.svg'));
const BG = '#0b0f1a'; // matches the PWA manifest background_color

// favicon.svg has viewBox 0 0 64 64 and no intrinsic size, so scale the render
// density rather than upscaling a 64px raster (which would be soft).
const render = (size) =>
  sharp(svg, { density: Math.round(72 * (size / 64)) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png();

async function plain(size, out) {
  await render(size).toFile(path.join(PUB, out));
  console.log(`  ${out.padEnd(26)} ${size}x${size}  transparent`);
}

// Maskable icons get cropped to a circle/squircle by the launcher, so the
// artwork has to sit inside the middle ~80%. Touch icons need a solid backdrop
// because iOS composites transparency onto an unpredictable colour.
async function padded(size, inner, out) {
  const art = await render(inner).toBuffer();
  const off = Math.round((size - inner) / 2);
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: art, top: off, left: off }])
    .png()
    .toFile(path.join(PUB, out));
  console.log(`  ${out.padEnd(26)} ${size}x${size}  ${BG}, art ${Math.round((inner / size) * 100)}%`);
}

(async () => {
  await plain(192, 'icon-192.png');
  await plain(512, 'icon-512.png');
  await padded(512, 410, 'icon-512-maskable.png'); // 80% safe zone
  await padded(180, 162, 'apple-touch-icon.png');  // 90%, iOS applies its own mask
})();
