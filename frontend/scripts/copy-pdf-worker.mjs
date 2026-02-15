import { createRequire } from 'module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.mjs');

const dest = path.join(process.cwd(), 'dist', 'pdf.worker.mjs');

try {
  fs.cpSync(pdfWorkerPath, dest, { recursive: true });
  console.log(`Copied pdf.worker.mjs to ${dest}`);
} catch (err) {
  console.error('Failed to copy pdf.worker.mjs:', err);
  process.exit(1);
}
