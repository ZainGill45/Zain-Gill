import { defineConfig } from "vite";
import path from "path";
import fs from "fs-extra";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const srcDir = path.resolve(__dirname, "src");
const distDir = path.resolve(__dirname, "dist");

// Function to process styles.css through Tailwind CSS
async function processTailwindCSS() {
  const cssInput = path.join(srcDir, "css", "styles.css");
  const cssOutput = path.join(distDir, "css", "styles.css");
  const css = await fs.readFile(cssInput, "utf8");

  const result = await postcss([tailwindcss, autoprefixer]).process(css, {
    from: cssInput,
    to: cssOutput,
  });

  await fs.ensureDir(path.dirname(cssOutput));
  await fs.writeFile(cssOutput, result.css);
  if (result.map) {
    await fs.writeFile(`${cssOutput}.map`, result.map);
  }
}

// Sync other files from src to dist
async function syncFiles() {
  await fs.copy(srcDir, distDir, {
    filter: (file) => !file.endsWith("styles.css"), // Exclude styles.css for separate processing
  });
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(srcDir, "index.php"),
      },
    },
  },
  plugins: [
    {
      name: "file-sync-and-tailwind",
      apply: "serve",
      configureServer(server) {
        server.watcher.on("all", async (event, file) => {
          if (file.startsWith(srcDir)) {
            if (file.endsWith("styles.css")) {
              await processTailwindCSS();
            } else {
              await syncFiles();
            }
            server.ws.send({ type: "full-reload" });
          }
        });
      },
      async buildStart() {
        await processTailwindCSS();
        await syncFiles();
      },
    },
  ],
});
