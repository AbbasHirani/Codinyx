import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

function copyDirPlugin(src: string, dest: string) {
  return {
    name: "copy-dir",
    closeBundle() {
      function copyDir(s: string, d: string) {
        mkdirSync(d, { recursive: true });
        for (const f of readdirSync(s)) {
          const sp = join(s, f), dp = join(d, f);
          statSync(sp).isDirectory() ? copyDir(sp, dp) : copyFileSync(sp, dp);
        }
      }
      copyDir(src, dest);
    },
  };
}

function copyFilePlugin(src: string, dest: string) {
  return {
    name: "copy-file",
    closeBundle() {
      copyFileSync(src, dest);
    },
  };
}

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  root,
  plugins: [
    react(),
    copyFilePlugin(
      resolve(__dirname, "manifest.json"),
      resolve(outDir, "manifest.json")
    ),
    copyDirPlugin(
      resolve(__dirname, "public/icons"),
      resolve(outDir, "icons")
    ),
  ],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(root, "sidepanel/index.html"),
        background: resolve(root, "background/index.ts"),
        content: resolve(root, "content/index.ts"),
      },
      output: {
        entryFileNames: "[name]/index.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
