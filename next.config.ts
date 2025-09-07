import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // TailwindCSS가 클라이언트에서 fs 모듈을 사용하지 않도록 설정
    serverComponentsExternalPackages: ['@nodelib/fs.scandir', '@nodelib/fs.walk', 'fast-glob'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트에서 Node.js 모듈을 사용하지 않도록 설정
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        querystring: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    // TailwindCSS 관련 모듈들을 서버에서만 사용하도록 설정
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        '@nodelib/fs.scandir': 'commonjs @nodelib/fs.scandir',
        '@nodelib/fs.walk': 'commonjs @nodelib/fs.walk',
        'fast-glob': 'commonjs fast-glob',
      });
    }
    
    return config;
  },
};

export default nextConfig;
