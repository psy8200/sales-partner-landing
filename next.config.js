/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 호환 설정
  serverExternalPackages: ['@nodelib/fs.scandir', '@nodelib/fs.walk', 'fast-glob'],
  
  // 폰트 최적화 설정 - preload 경고 해결
  experimental: {
    optimizeCss: true,
  },
  
  // 개발 환경에서 캐시 비활성화
  ...(process.env.NODE_ENV === 'development' && {
    // 개발 모드에서 캐시 완전 비활성화
    generateEtags: false,
    poweredByHeader: false,
  }),
  
  // PWA 지원 설정
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development' 
              ? 'no-cache, no-store, must-revalidate' 
              : 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development'
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 개발 환경에서 모든 정적 자원 캐시 비활성화
      ...(process.env.NODE_ENV === 'development' ? [
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
          ],
        },
      ] : []),
    ];
  },
  
  // 정적 자원 최적화
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
};

module.exports = nextConfig;
