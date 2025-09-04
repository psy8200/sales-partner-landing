import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "파트너센터 - 세일즈 파트너",
  description: "세일즈 파트너 회원 전용 앱 - 수익 현황, 활동 내역, 계약 관리",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="member-layout">
      {children}
    </div>
  );
}




