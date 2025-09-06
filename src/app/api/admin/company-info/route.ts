import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: 회사 정보 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/company-info 시작');
    
    // 데이터베이스에서 회사 정보 조회
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (companyInfo) {
      console.log('✅ 회사 정보 조회 성공:', companyInfo.companyName);
      return NextResponse.json({ 
        success: true, 
        companyInfo 
      });
    } else {
      // 회사 정보가 없으면 기본값 반환
      console.log('⚠️ 회사 정보 없음, 기본값 반환');
      const defaultCompanyInfo = {
        companyName: '세일즈 파트너',
        businessNumber: '123-45-67890',
        representative: '대표이사',
        address: '서울특별시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@salespartner.com',
        website: 'https://salespartner.com',
        description: '최고의 세일즈 파트너 서비스를 제공합니다.',
        referralCodeDefault: 'SP2024',
        isActive: true
      };
      
      return NextResponse.json({ 
        success: true, 
        companyInfo: defaultCompanyInfo 
      });
    }
  } catch (error) {
    console.error('회사 정보 조회 오류:', error);
    return NextResponse.json({ 
      error: '회사 정보를 불러올 수 없습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// PUT: 회사 정보 수정
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/admin/company-info 시작');
    
    const body = await request.json();
    console.log('🔍 수정 요청 데이터:', body);
    
    // 필수 필드 검증
    const requiredFields = ['companyName', 'businessNumber', 'representative', 'address', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json({ 
          error: `${field} 필드는 필수입니다.` 
        }, { status: 400 });
      }
    }
    
    // 기존 회사 정보 조회
    const existingCompany = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (existingCompany) {
      // 기존 회사 정보 업데이트
      const updatedCompany = await prisma.companyInfo.update({
        where: { id: existingCompany.id },
        data: {
          companyName: body.companyName,
          businessNumber: body.businessNumber,
          representative: body.representative,
          address: body.address,
          phone: body.phone,
          email: body.email,
          website: body.website || null,
          description: body.description || null,
          referralCodeDefault: body.referralCodeDefault || null,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ 회사 정보 업데이트 성공:', updatedCompany.companyName);
      return NextResponse.json({ 
        success: true, 
        companyInfo: updatedCompany,
        message: '회사 정보가 성공적으로 수정되었습니다.'
      });
    } else {
      // 새로운 회사 정보 생성
      const newCompany = await prisma.companyInfo.create({
        data: {
          companyName: body.companyName,
          businessNumber: body.businessNumber,
          representative: body.representative,
          address: body.address,
          phone: body.phone,
          email: body.email,
          website: body.website || null,
          description: body.description || null,
          referralCodeDefault: body.referralCodeDefault || null,
          isActive: true
        }
      });
      
      console.log('✅ 회사 정보 생성 성공:', newCompany.companyName);
      return NextResponse.json({ 
        success: true, 
        companyInfo: newCompany,
        message: '회사 정보가 성공적으로 생성되었습니다.'
      });
    }
  } catch (error) {
    console.error('회사 정보 수정 오류:', error);
    return NextResponse.json({ 
      error: '회사 정보 수정 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}