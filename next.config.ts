/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true, // 👈 This is what enables /about instead of /about.html
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;