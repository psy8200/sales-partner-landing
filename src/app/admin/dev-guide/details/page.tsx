'use client';

import React from 'react';

export default function DevelopmentDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개발 세부내용</h1>
        
        <div className="space-y-8">
          {/* 시스템 개요 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 시스템 개요</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">기술 스택</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Frontend:</strong> Next.js 15.4.3 + React + TypeScript</li>
                  <li>• <strong>Styling:</strong> Tailwind CSS</li>
                  <li>• <strong>Database:</strong> SQLite + Prisma ORM</li>
                  <li>• <strong>Authentication:</strong> Custom Session Management</li>
                  <li>• <strong>Deployment:</strong> Vercel (예정)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">주요 기능</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>회원 관리:</strong> 일반회원, 파트너회원, 관리자</li>
                  <li>• <strong>파트너 신청:</strong> 상담신청 및 승인 시스템</li>
                  <li>• <strong>계약 관리:</strong> 렌탈, 상조, 보험 계약</li>
                  <li>• <strong>포인트 시스템:</strong> 적립 및 사용</li>
                  <li>• <strong>관리자 대시보드:</strong> 통계 및 관리 기능</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 데이터베이스 스키마 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🗄️ 데이터베이스 스키마</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">User 모델</h3>
                <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                  <div>id: String @id @default(cuid)</div>
                  <div>name: String</div>
                  <div>email: String @unique</div>
                  <div>phone: String</div>
                  <div>password: String</div>
                  <div>role: UserRole @default(GENERAL)</div>
                  <div>level: Int @default(1)</div>
                  <div>status: UserStatus @default(ACTIVE)</div>
                  <div>partnerStatus: PartnerApplicationStatus?</div>
                  <div>referralCode: String?</div>
                  <div>points: Int @default(0)</div>
                  <div>bankName: String?</div>
                  <div>accountHolder: String?</div>
                  <div>bankAccount: String?</div>
                  <div>agreeTerms: Boolean @default(false)</div>
                  <div>agreeTermsAt: DateTime?</div>
                  <div>lastLoginAt: DateTime?</div>
                  <div>loginCount: Int @default(0)</div>
                  <div>createdAt: DateTime @default(now())</div>
                  <div>updatedAt: DateTime @updatedAt</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">PartnerApplication 모델</h3>
                <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                  <div>id: String @id @default(cuid)</div>
                  <div>userId: String</div>
                  <div>user: User @relation(fields: [userId], references: [id])</div>
                  <div>consultationDate: DateTime?</div>
                  <div>area: String</div>
                  <div>consultationTime: String?</div>
                  <div>referrer: String</div>
                  <div>memo: String?</div>
                  <div>status: PartnerApplicationStatus @default(NEW)</div>
                  <div>cancelledAt: DateTime?</div>
                  <div>cancelReason: String?</div>
                  <div>cancelledBy: String?</div>
                  <div>createdAt: DateTime @default(now())</div>
                  <div>updatedAt: DateTime @updatedAt</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">CompanyInfo 모델</h3>
                <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                  <div>id: String @id @default(cuid)</div>
                  <div>companyName: String</div>
                  <div>companyLogo: String?</div>
                  <div>bottomLogo: String?</div>
                  <div>businessNumber: String?</div>
                  <div>representative: String?</div>
                  <div>address: String?</div>
                  <div>phone: String?</div>
                  <div>email: String?</div>
                  <div>website: String?</div>
                  <div>description: String?</div>
                  <div>referralCodeDefault: String?</div>
                  <div>isActive: Boolean @default(true)</div>
                  <div>createdAt: DateTime @default(now())</div>
                  <div>updatedAt: DateTime @updatedAt</div>
                </div>
              </div>
            </div>
          </section>

          {/* API 엔드포인트 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔌 API 엔드포인트</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">인증 관련</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/signup</strong> - 회원가입
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/login</strong> - 로그인
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/logout</strong> - 로그아웃
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>GET /api/admin/auth/me</strong> - 관리자 세션 확인
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">관리자 API</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/users</strong> - 회원 목록 조회
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>PUT /api/admin/users/[id]</strong> - 회원 정보 수정
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/company-info</strong> - 회사 정보 조회
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>PUT /api/admin/company-info</strong> - 회사 정보 수정
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/contracts/requests</strong> - 상담신청 목록
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">파트너 신청</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>POST /api/partner/apply</strong> - 파트너 신청
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>DELETE /api/admin/contracts/requests/[id]</strong> - 상담신청 삭제
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 주요 기능 구현 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚙️ 주요 기능 구현</h2>
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">🔐 인증 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>세션 관리:</strong> HTTP-only 쿠키 기반 세션</div>
                  <div>• <strong>자동 갱신:</strong> 세션 만료 시 자동 갱신</div>
                  <div>• <strong>권한 관리:</strong> 역할 기반 접근 제어 (RBAC)</div>
                  <div>• <strong>보안 필드:</strong> referralCode, points는 최고등급 관리자만 수정 가능</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">👥 회원 관리</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>회원 등급:</strong> GENERAL, MEMBER, ADMIN</div>
                  <div>• <strong>파트너 상태:</strong> 미신청, 신청중, 승인됨, 거절됨</div>
                  <div>• <strong>추천인 코드:</strong> 회원가입 시 입력, 기본값은 회사정보에서 설정</div>
                  <div>• <strong>포인트 시스템:</strong> 적립 및 사용 내역 관리</div>
                  <div>• <strong>은행 정보:</strong> 계좌 정보 관리</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">🤝 파트너 신청 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>신청 폼:</strong> 상담가능날짜, 지역, 시간, 추천인, 메모</div>
                  <div>• <strong>추천인 코드:</strong> 회원의 referralCode 또는 기본 추천인 코드 자동 적용</div>
                  <div>• <strong>상태 관리:</strong> NEW → ASSIGNED → IN_PROGRESS → DONE</div>
                  <div>• <strong>삭제 기능:</strong> 삭제 시 파트너 신청 버튼 재활성화</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">📊 관리자 대시보드</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>회원 관리:</strong> 일반회원, 파트너회원, 관리자 분리 관리</div>
                  <div>• <strong>상담신청 관리:</strong> 파트너 신청 목록 및 상태 관리</div>
                  <div>• <strong>회사 정보 관리:</strong> 기본 추천인 코드 등 회사 정보 설정</div>
                  <div>• <strong>통계 대시보드:</strong> 회원 수, 신청 건수 등 통계</div>
                </div>
              </div>
            </div>
          </section>

          {/* 최근 해결된 문제들 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔧 최근 해결된 문제들</h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 파트너 승인 시스템 완성</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• API에서 role과 partnerStatus 필드 업데이트 추가</div>
                  <div>• 파트너 승인 시 MEMBER 역할과 APPROVED 상태로 변경</div>
                  <div>• 승인된 사용자가 파트너회원 목록으로 정상 이동</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 인증 시스템 개선</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• adminSession 쿠키 기반 인증으로 통일</div>
                  <div>• base64url 디코딩 로직 적용</div>
                  <div>• 권한 검증 우회로 개발 중 문제 해결</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 데이터베이스 스키마 안정화</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• User 모델에 bankName, accountHolder, bankAccount 필드 추가</div>
                  <div>• agreeTerms, agreeTermsAt 필드 추가</div>
                  <div>• PartnerApplication 모델에 area, referrer 필드 추가</div>
                  <div>• CompanyInfo 모델에 referralCodeDefault 필드 추가</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 하드코딩 제거</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• &quot;SP001&quot; 하드코딩 완전 제거</div>
                  <div>• 기본 추천인 코드를 회사정보에서 동적 로드</div>
                  <div>• 모든 필드값을 데이터베이스에서 관리</div>
                </div>
              </div>
            </div>
          </section>

          {/* 현재 시스템 상태 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 현재 시스템 상태</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">✅ 완료된 기능</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 회원가입 및 로그인 시스템</li>
                  <li>• 관리자 인증 및 권한 관리</li>
                  <li>• 회원 정보 관리 (일반/파트너/관리자)</li>
                  <li>• 파트너 신청 및 승인 시스템</li>
                  <li>• 상담신청 관리</li>
                  <li>• 회사 정보 관리</li>
                  <li>• 포인트 시스템 기반 구조</li>
                  <li>• 은행 정보 관리</li>
                  <li>• 추천인 코드 시스템</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">🚧 개발 중인 기능</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 계약 관리 시스템</li>
                  <li>• 결제 시스템</li>
                  <li>• 정산 시스템</li>
                  <li>• 알림 시스템</li>
                  <li>• 통계 대시보드</li>
                  <li>• 모바일 최적화</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 개발 환경 설정 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚙️ 개발 환경 설정</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">필수 명령어</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npm install
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npx prisma generate
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npx prisma db push
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npm run dev
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">문제 해결</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-50 p-3 rounded">
                    <strong>EPERM 오류:</strong> taskkill /f /im node.exe 후 재시작
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <strong>Prisma 오류:</strong> npx prisma generate && npx prisma db push
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <strong>캐시 문제:</strong> .next 폴더 삭제 후 재시작
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 백업 정보 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">💾 백업 정보</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">백업 위치</h3>
                <div className="bg-blue-50 p-4 rounded text-sm">
                  <div><strong>시스템 백업:</strong> backups/system-backup-2025-01-31_15-30-00/</div>
                  <div><strong>데이터베이스:</strong> prisma/dev.db</div>
                  <div><strong>스키마:</strong> prisma/schema.prisma</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">복원 방법</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 시스템 백업: src 폴더를 백업에서 복사</div>
                  <div>• 데이터베이스: dev.db 파일을 prisma 폴더에 복사</div>
                  <div>• 스키마: schema.prisma 파일을 prisma 폴더에 복사</div>
                  <div>• 의존성: npm install 실행</div>
                  <div>• Prisma: npx prisma generate && npx prisma db push</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

