/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return [];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Limite du body pour les routes qui lisent le body (ex. proxy /api/prompteur/import-pptx). Défaut 10 Mo.
    proxyClientMaxBodySize: "100mb",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
