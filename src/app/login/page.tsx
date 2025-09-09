import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg">
        <div className="text-center mb-10">
          {/* 회사 로고 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            <img 
              src="/logo.png" 
              alt="세일즈 파트너 로고" 
              className="mx-auto h-16 w-auto"
            />
          </h1>
          <p className="text-gray-600 text-lg">환영합니다. 행복한 하루 되세요!</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}