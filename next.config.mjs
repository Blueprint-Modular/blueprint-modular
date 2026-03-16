/** @type {import('next').NextConfig} */
// Cache-buster favicon à chaque build (force le rafraîchissement navigateur)
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_FAVICON_V: String(Date.now()),
  },
  async redirects() {
    return [
      { source: "/", destination: "/dashboard", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/img/logo-bpm.png" },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Limite body pour les Route Handlers (proxy / upload) — défaut 10 Mo, 413 au-delà (ex. import PPTX Monitor)
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
