import PwaSignupForm from '../signup/PwaSignupForm'

async function getDefaultReferralCode() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/company-info`, {
      cache: 'no-store'
    });
    const data = await response.json();
    
    if (data.success && data.companyInfo && data.companyInfo.referralCodeDefault) {
      return data.companyInfo.referralCodeDefault;
    }
    return '';
  } catch (error) {
    console.error('기본 추천인코드 로드 오류:', error);
    return '';
  }
}

export default async function PwaSignupPage() {
  const defaultReferralCode = await getDefaultReferralCode();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 w-full max-w-sm sm:max-w-lg md:max-w-2xl">
        <div className="text-center mb-6">
          {/* 회사 로고 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <img 
              src="/logo.png" 
              alt="세일즈 파트너 로고" 
              className="mx-auto h-16 w-auto"
            />
          </h1>
          <p className="text-gray-700 text-sm font-medium">회원가입으로 평생연금을 만드세요~!!</p>
        </div>
        <PwaSignupForm 
          defaultReferralCode={defaultReferralCode || ""}
          phonePlaceholder="010-1234-5678"
          referralPlaceholder="추천인코드를 입력하세요"
        />
      </div>
    </div>
  )
}
