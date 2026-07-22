/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

// 確保在容器環境中綁定 0.0.0.0
process.env.HOSTNAME = '0.0.0.0';

module.exports = nextConfig;
