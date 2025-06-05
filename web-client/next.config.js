/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: [
      "jumboargentina.vteximg.com.br",
      "jumboargentina.vtexassets.com",
      "ardiaprod.vtexassets.com",
      "carrefourar.vtexassets.com",
      "static.cotodigital3.com.ar"
    ],
  },
  trailingSlash: true
};

module.exports = nextConfig;
