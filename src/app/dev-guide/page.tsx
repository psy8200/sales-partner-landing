'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DevGuideRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // 어드민 개발가이드로 리다이렉트
    router.push('/admin/dev-guide');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-8"></div>
        <h1 className="text-2xl font-bold mb-4">🔄 리다이렉트 중...</h1>
        <p className="text-gray-400">어드민 페이지로 이동하고 있습니다.</p>
        <p className="text-sm text-gray-500 mt-2">
          자동으로 이동되지 않으면{' '}
          <a 
            href="/admin/dev-guide" 
            className="text-yellow-400 hover:text-yellow-300 underline"
          >
            여기를 클릭하세요
          </a>
        </p>
      </div>
    </div>
  );
};

export default DevGuideRedirect; 