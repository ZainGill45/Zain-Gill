import { defineConfig } from "vite";
import path from "path";
import fs from "fs/promises"; // Use the built-in promises API for async file operations
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const srcDir = path.resolve(__dirname, "src");
const distDir = path.resolve(__dirname, "dist");

// Function to process styles.css through Tailwind CSS
async function processTailwindCSS() {
  const cssInput = path.join(srcDir, "css", "styles.css");
  const cssOutput = path.join(distDir, "css", "styles.css");
  try {
    const css = await fs.readFile(cssInput, "utf8");

    const result = await postcss([tailwindcss, autoprefixer]).process(css, {
      from: cssInput,
      to: cssOutput,
    });

    await fs.mkdir(path.dirname(cssOutput), { recursive: true });
    await fs.writeFile(cssOutput, result.css);

    if (result.map) {
      await fs.writeFile(`${cssOutput}.map`, result.map.toString());
    }
  } catch (err) {
    console.error(`Error processing Tailwind CSS: ${err.message}`);
  }
}

// Function to copy files recursively from src to dist
async function copyFiles(src, dest) {
  try {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await copyFiles(srcPath, destPath);
      } else if (!srcPath.endsWith("styles.css")) {
        // Skip styles.css since it's processed separately
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error(`Error copying files: ${err.message}`);
  }
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(srcDir, "index.php"),
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss("./tailwind.config.js"), // Point to your Tailwind config
        autoprefixer(), // Add vendor prefixes
      ],
    },
  },
  server: {
    watch: {
      usePolling: true, // Ensures Vite watches files properly in problematic environments
      interval: 100, // Adjust polling interval as needed
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
              await copyFiles(srcDir, distDir);
            }
            server.ws.send({ type: "full-reload" });
          }
        });
      },
      async buildStart() {
        await processTailwindCSS();
        await copyFiles(srcDir, distDir);
      },
    },
  ],
});
