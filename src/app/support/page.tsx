'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SupportPost {
  id: string;
  title: string;
  content: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  answeredAt?: string;
  answer?: string;
}

 const SupportPage = () => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
   const [posts, setPosts] = useState<SupportPost[]>([]);
   const [formData, setFormData] = useState({
     title: '',
     content: ''
   });

  useEffect(() => {
    // 로그인된 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        window.location.href = '/login';
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // 실제로는 API에서 가져와야 함
      const mockPosts: SupportPost[] = [
        {
          id: '1',
          title: '파트너 승인 문의',
          content: '파트너 신청을 했는데 승인이 언제 되는지 궁금합니다.',
          status: 'ANSWERED',
          createdAt: '2024-01-15T10:30:00Z',
          answeredAt: '2024-01-16T14:20:00Z',
          answer: '안녕하세요. 파트너 신청은 보통 1-2일 내에 검토 완료됩니다. 현재 검토 중이니 조금만 기다려주세요.'
        },
        {
          id: '2',
          title: '수익 정산 관련 문의',
          content: '이번 달 수익이 정산되지 않았습니다. 확인 부탁드립니다.',
          status: 'PENDING',
          createdAt: '2024-01-20T09:15:00Z'
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('문의글 목록 가져오기 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      // 실제로는 API로 전송해야 함
      const newPost: SupportPost = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

             setPosts(prev => [newPost, ...prev]);
       setFormData({ title: '', content: '' });
       alert('문의글이 등록되었습니다.');
    } catch (error) {
      console.error('문의글 등록 실패:', error);
      alert('문의글 등록에 실패했습니다.');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '답변대기';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '처리완료';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ANSWERED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-4"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                고객센터 문의
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                궁금한 점이 있으시면 언제든 문의해주세요
              </p>
            </motion.div>
          </div>
        </div>
      </div>

             {/* 메인 콘텐츠 */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
         {/* 문의글 작성 폼 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
         >
           <h2 className="text-lg font-semibold text-gray-900 mb-4">문의글 작성</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                 제목 *
               </label>
               <input
                 id="title"
                 type="text"
                 value={formData.title}
                 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="문의 제목을 입력하세요"
                 required
               />
             </div>
             <div>
               <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                 내용 *
               </label>
               <textarea
                 id="content"
                 value={formData.content}
                 onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                 rows={5}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="문의 내용을 자세히 입력하세요"
                 required
               />
             </div>
             <div className="text-right">
               <button
                 type="submit"
                 className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
               >
                 문의하기
               </button>
             </div>
           </form>
         </motion.div>

        {/* 문의글 목록 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">내 문의글 목록</h2>
          
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600">아직 작성한 문의글이 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">궁금한 점이 있으시면 새 문의글을 작성해보세요.</p>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(post.status)}`}>
                    {getStatusLabel(post.status)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  작성일: {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </div>

                {post.answer && (
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-blue-800">답변</span>
                      <span className="text-xs text-blue-600 ml-2">
                        {post.answeredAt && new Date(post.answeredAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{post.answer}</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* 하단 고정 메뉴바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {/* 홈 */}
          <button 
                          onClick={() => window.location.href = '/mypage'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">홈</span>
          </button>
          
          {/* 신청내역 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-xl mb-1">📋</span>
            <span className="text-xs font-medium">신청내역</span>
          </button>
          
          {/* 정산관리 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-xl mb-1">💰</span>
            <span className="text-xs font-medium">정산관리</span>
          </button>
          
          {/* 나의조직도 */}
          <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-xl mb-1">🌳</span>
            <span className="text-xs font-medium">나의조직도</span>
          </button>
          
          {/* 프로필 */}
          <button 
            onClick={() => window.location.href = '/profile'}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl mb-1">👤</span>
            <span className="text-xs font-medium">프로필</span>
          </button>
        </div>
      </div>

      {/* 하단 메뉴바 공간 확보 */}
      <div className="h-20"></div>
    </div>
  );
};

export default SupportPage;
