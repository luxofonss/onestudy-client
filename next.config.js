/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },

  // Ensure CSS is properly handled in standalone output
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.css$/,
  //     use: ["style-loader", "css-loader", "postcss-loader"],
  //   });
  //   return config;
  // },
};

module.exports = nextConfig;
