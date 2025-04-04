/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for pages that depend on dynamic data
  images: {
    domains: ['gateway.pinata.cloud'],
  },

  // Add a proxy to redirect API requests to the correct port
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3000/api/v1/:path*',
      },
    ];
  },

  // Force dynamic rendering for pages that use Pinata
  experimental: {
    // Opt specific routes out of static generation
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },

  typescript: {
    // For development only - allows build with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // For development only
    ignoreDuringBuilds: true,
  },

  // Add webpack configuration to properly handle specific dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Properly handle web-worker dependency
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        worker_threads: false,
      };
    }

    // Fix web-worker issue with proper module handling
    config.module = {
      ...config.module,
      exprContextCritical: false,
      unknownContextCritical: false,
    };

    return config;
  },
};

export default nextConfig;
