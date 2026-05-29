// Generates placeholder PNG icons using pure SVG → data URI approach
// Run: node scripts/generate-icons.mjs
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, "../public/icons");
mkdirSync(outDir, { recursive: true });

// Minimal 1x1 violet PNG (placeholder) for each size
// Real icons would be designed assets; these keep the build working
const sizes = [16, 32, 48, 128];

// Minimal valid PNG bytes for a solid violet #7c3aed square
// Generated via: convert -size NxN xc:#7c3aed icon.png | base64
// Using a pre-built minimal PNG structure for a 1x1 purple pixel, scaled via manifest
const PNG_1X1_VIOLET = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

for (const size of sizes) {
  // Write the same 1x1 PNG — Chrome will scale it
  // For production, replace with properly sized assets
  writeFileSync(join(outDir, `icon${size}.png`), PNG_1X1_VIOLET);
  console.log(`✓ icon${size}.png`);
}

console.log("Icons written to", outDir);
console.log("Note: Replace with proper icons before publishing.");
