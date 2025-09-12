// 어드민 개발도구 새로고침 메시지 처리 스크립트
(function() {
  'use strict';
  
  // 새로고침 메시지 리스너 등록
  window.addEventListener('message', function(event) {
    // 보안을 위해 origin 체크 (필요시 추가)
    if (event.data && event.data.type === 'REFRESH') {
      console.log('개발도구에서 새로고침 요청 받음');
      
      // 현재 페이지를 새로고침 (로그인 상태 유지)
      window.location.reload();
    }
  });
  
  console.log('개발도구 새로고침 스크립트 로드됨');
})();



