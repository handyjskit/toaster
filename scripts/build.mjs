import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "src", "toaster.js");
const cssPath = path.join(root, "src", "toaster.css");
const distDir = path.join(root, "dist");

const banner = "/*! toaster package | MIT License */";
const source = await readFile(srcPath, "utf8");
const css = await readFile(cssPath, "utf8");
const bundledSource = source.replace("__TOASTER_CSS__", JSON.stringify(css));

function minify(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n\s+/g, "\n")
    .replace(/\n+/g, "\n")
    .replace(/^\s+|\s+$/gm, "")
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ");
}

const iife = `${banner}
const Toaster=(()=>{${bundledSource}})();
`;

const esm = `${banner}
const api=(()=>{${bundledSource}})();
export const createToaster=api.createToaster;
export const toast=api.toast;
export const success=api.success;
export const error=api.error;
export const info=api.info;
export const warning=api.warning;
export const POSITIONS=api.POSITIONS;
export const DEFAULT_ICONS=api.DEFAULT_ICONS;
export const TYPE_PRESETS=api.TYPE_PRESETS;
export default api;
`;

const cjs = `${banner}
const api=(()=>{${bundledSource}})();
module.exports=api;
module.exports.default=api;
`;

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, "toaster.js"), iife);
await writeFile(path.join(distDir, "toaster.min.js"), minify(iife));
await writeFile(path.join(distDir, "toaster.esm.js"), esm);
await writeFile(path.join(distDir, "toaster.cjs"), cjs);
