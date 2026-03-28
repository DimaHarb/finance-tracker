import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@finance-tracker/db', '@finance-tracker/validators'],
};

export default nextConfig;
