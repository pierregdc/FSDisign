import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

const localCaPath = path.resolve(process.cwd(), ".cert", "ca.pem");
if (fs.existsSync(localCaPath) && !process.env.NODE_EXTRA_CA_CERTS) {
  process.env.NODE_EXTRA_CA_CERTS = localCaPath;
}

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
