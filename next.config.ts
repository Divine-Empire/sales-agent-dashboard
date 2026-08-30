import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Next.js defaults this to 1MB, which silently 413s any machine
      // document upload before it even reaches the backend's own 10MB limit
      // (app/documents.py's MAX_UPLOAD_BYTES) — found live via the Catalog
      // page's upload form. Match the backend's limit so the two agree.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
