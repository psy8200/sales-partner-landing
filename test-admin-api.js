// 관리자 API 테스트
async function testAdminAPI() {
  try {
    console.log('🔍 관리자 API 테스트 시작...');
    
    // 먼저 로그인하여 세션 토큰 획득
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'psy',
        password: '0130'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ 로그인 성공:', loginData.user?.name);
    
    // adminSession 쿠키 값 추출
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const adminSessionMatch = setCookieHeader.match(/adminSession=([^;]+)/);
    const adminSessionValue = adminSessionMatch ? adminSessionMatch[1] : null;
    
    if (!adminSessionValue) {
      console.log('❌ adminSession 쿠키를 찾을 수 없습니다.');
      return;
    }
    
    // /api/admin/admins API 호출
    const adminsResponse = await fetch('http://localhost:3000/api/admin/admins', {
      method: 'GET',
      headers: {
        'Cookie': `adminSession=${adminSessionValue}`
      }
    });
    
    console.log('\n🔍 /api/admin/admins API 응답:');
    console.log('Status:', adminsResponse.status);
    
    const adminsData = await adminsResponse.json();
    console.log('Response:', adminsData);
    
    if (adminsData.admins) {
      console.log('\n📋 관리자 목록:');
      adminsData.admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
        console.log(`   - 역할: ${admin.role}`);
        console.log(`   - 상태: ${admin.status}`);
        console.log(`   - 접속상태: ${admin.isOnline ? '접속중' : '대기중'}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ API 테스트 오류:', error);
  }
}

testAdminAPI();

