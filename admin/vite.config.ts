import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Staff portal + CMS shell, deployed to Firebase Hosting (firebase.json →
// hosting.public = admin/dist). Kept out of the public site's origin on purpose.
export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [
    react(),
    {
      // Firebase Hosting serves /cms/ from public/cms/index.html; mirror that in dev.
      name: "cms-index",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && /^\/cms\/?(\?.*)?$/.test(req.url)) req.url = "/cms/index.html";
          next();
        });
      },
    },
  ],
  resolve: { alias: { "@site": path.resolve(__dirname, "../src") } },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false },
  server: { port: 5175, strictPort: true },
});
