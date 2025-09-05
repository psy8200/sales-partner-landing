import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testKoreanEncoding() {
  try {
    console.log('🌏 한글 인코딩 테스트 시작...');
    
    // 테스트용 한글 데이터
    const testData = {
      name: '김철수',
      email: 'test@example.com',
      phone: '010-1234-5678',
      password: 'test123',
      confirmPassword: 'test123',
      agreeTerms: true,
      marketingAgreed: false
    };

    console.log('\n📝 테스트 데이터:');
    console.log(`이름: "${testData.name}"`);
    console.log(`이메일: "${testData.email}"`);
    console.log(`전화번호: "${testData.phone}"`);

    // 회원가입 API 테스트
    console.log('\n🔍 회원가입 API 테스트...');
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(testData)
    });

    const signupResult = await signupResponse.text();
    console.log('회원가입 응답:', signupResult);

    if (signupResponse.ok) {
      const signupData = JSON.parse(signupResult);
      console.log('✅ 회원가입 성공');
      console.log(`저장된 이름: "${signupData.data.user.name}"`);
      
      // 데이터베이스에서 직접 확인
      const user = await prisma.user.findUnique({
        where: { email: testData.email },
        select: { id: true, name: true, email: true, phone: true }
      });

      if (user) {
        console.log('\n🗄️ 데이터베이스 직접 조회:');
        console.log(`ID: ${user.id}`);
        console.log(`이름: "${user.name}"`);
        console.log(`이메일: "${user.email}"`);
        console.log(`전화번호: "${user.phone}"`);
        
        // 한글 인코딩 검증
        if (user.name === testData.name) {
          console.log('✅ 한글 인코딩 정상');
        } else {
          console.log('❌ 한글 인코딩 문제 발견');
          console.log(`예상: "${testData.name}"`);
          console.log(`실제: "${user.name}"`);
        }
      }
    } else {
      console.log('❌ 회원가입 실패');
    }

    // 문의사항 API 테스트
    console.log('\n🔍 문의사항 API 테스트...');
    const inquiryData = {
      title: '한글 제목 테스트',
      content: '한글 내용 테스트입니다. 특수문자: !@#$%^&*()',
      type: 'QUESTION'
    };

    const inquiryResponse = await fetch('http://localhost:3000/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cookie': 'authToken=test-user-id' // 테스트용
      },
      body: JSON.stringify(inquiryData)
    });

    const inquiryResult = await inquiryResponse.text();
    console.log('문의사항 응답:', inquiryResult);

    if (inquiryResponse.ok) {
      console.log('✅ 문의사항 API 응답 정상');
    } else {
      console.log('❌ 문의사항 API 응답 실패');
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testKoreanEncoding();
