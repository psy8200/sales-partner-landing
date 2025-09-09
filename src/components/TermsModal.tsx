'use client'

import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">세일즈파트너스 이용약관</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="닫기"
            aria-label="모달 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 약관 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-4">세일즈파트너스 이용약관 (온라인 디지털콘텐츠) V1</h3>
            
            <div className="text-sm text-gray-700 space-y-4 leading-relaxed">
              <p>
                (주)세일즈파트너스 이용약관 온라인 디지털콘텐츠 서비스 이용에 관한 약관입니다.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>시행일:</strong> 2025년 9월 10일 / <strong>최신 개정:</strong> 2025년 9월 10일</p>
                <p>본 약관은 과학기술정보통신부·KISA '온라인디지털콘텐츠 표준약관'(고시 제2023-01호)을 준용하여 작성되었습니다.</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p><strong>사업자명:</strong> (주)세일즈파트너스</p>
                <p><strong>대표자:</strong> 박재용</p>
                <p><strong>사업자등록번호:</strong> 367-87-02260</p>
                <p><strong>통신판매업신고번호:</strong> 2025-서울서초-1353</p>
                <p><strong>사업장 소재지:</strong> 서울특별시 금천구 디지털로9길 68 2층 232호</p>
                <p><strong>고객센터:</strong> 1600-5360 / <strong>이메일:</strong> psy875874@gmail.com</p>
              </div>

              <p>
                본 약관은 (주)세일즈파트너스(이하 "회사")가 운영하는 웹사이트 salespartners.kr, dbkorea.kr, onpl.kr, yongdon.kr, smartfc.net, smartpaymall.com (이하 "사이트")에서 제공하는 온라인 디지털콘텐츠 플랫폼서비스(이하 "서비스")의 이용조건, 회사와 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">2. 정의</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"사이트":</strong> 회사가 플랫폼서비스를 제공 거래하기 위해 정보통신설비를 이용해 구축한 가상의 영업장을 말합니다.</li>
                <li><strong>"회원":</strong> 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자로서, 사업자회원과 개인회원(만 14세 이상)으로 구분됩니다.</li>
                <li><strong>"DB":</strong> 회사가 개인정보 보호법 등 관련 법령에 따라 수집·가공한 보험상담 희망자 정보(이름, 연락처, 상담이력 등) 데이터세트를 말합니다.</li>
                <li><strong>"구매자"·"파트너":</strong> 사이트에서 플랫폼을 구매 또는 신청한 회원을 말합니다.</li>
                <li><strong>"이용계약":</strong> 회원이 서비스 이용을 위해 회사와 체결하는 계약을 말합니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">3. 약관의 명시·효력·개정</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>회사는 본 약관을 사이트 초기 화면에 게시하며, 링크 등을 통해 회원이 쉽게 열람할 수 있도록 합니다.</li>
                <li>회사는 전자상거래법, 정보통신망법, 개인정보 보호법 등 관계 법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.</li>
                <li>약관을 개정할 경우 적용 예정일 및 개정 사유를 명시하여 현행 약관과 함께 최소 7일 전(회원에게 불리한 변경은 30일 전) 사이트 공지 및 전자우편 등으로 개별 고지합니다.</li>
                <li>회원이 개정 약관에 동의하지 않을 경우 서비스 이용을 중단하고 이용계약을 해지할 수 있으며, 고지된 적용일 이후에도 서비스를 계속 이용하면 변경에 동의한 것으로 간주합니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">4. 서비스의 내용</h4>
              <p>회사가 제공하는 서비스는 다음과 같습니다:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>회사가 운영하는 파트너 수익자동화 플랫폼, 쇼핑몰, 아이템별 상담 DB 목록 검색·열람 서비스</li>
                <li>DB 구매 및 전송(다운로드/열람) 서비스</li>
                <li>결제대행 및 정산 서비스</li>
                <li>구매내역·통계 리포트 제공</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
              </ul>
              <p>회사는 서비스의 일부 또는 전부를 변경·중단할 수 있으며, 변경 내용은 제3조 절차에 따라 공지합니다.</p>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">5. 회원가입 및 인증</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>회원가입은 만 14세 이상 개인 또는 사업자가 가능하며, 본인 명의 휴대전화·이메일 등 본인확인(KYC) 절차를 거쳐야 합니다.</li>
                <li>회원은 가입 신청 시 사실에 근거한 정보를 기재해야 하며, 허위 정보를 입력하거나 타인의 정보를 도용한 경우 승낙이 거절되거나 이용계약이 해지될 수 있습니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">6. 회원의 의무</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>회원은 관계 법령, 본 약관, 서비스 이용 안내 및 공지사항을 준수해야 합니다.</li>
                <li>회원은 DB를 스팸·불법 TM 등 '정보통신망법 제50조(영리 목적 광고성 정보 전송 제한)'을 위반하는 방식으로 활용할 수 없으며, 수신거부 안내를 포함한 합법적 마케팅 절차를 준수해야 합니다.</li>
                <li>회원은 회사의 사전 서면 동의 없이 서비스 정보를 복제·판매·재가공·제3자에게 제공하거나 영업에 이용할 수 없습니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">7. 회사의 의무</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>회사는 관련 법령과 약관을 준수하며, 지속·안정적인 서비스 제공을 위해 노력합니다.</li>
                <li>회사는 회원의 개인정보를 본인의 동의 없이 제3자에게 제공하지 않으며, 개인정보 처리방침을 준수합니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">8. 이용수수료·결제·정산</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>가격 및 과금 방식은 사이트 화면에 고지된 정책을 따릅니다.</li>
                <li>회사는 신용카드, 간편결제, 계좌이체 등 국내 결제수단을 제공합니다.</li>
                <li>회원은 반드시 본인 명의 결제수단을 사용해야 합니다.</li>
                <li>결제·정산 업무는 회사가 지정한 결제대행사(토스페이먼츠 등)를 통해 처리됩니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">9. 청약철회·환불</h4>
              <p>'내용 확인이 가능한 디지털콘텐츠'에 해당하여, 다운로드·열람이 시작된 경우 전자상거래법 제17조 제2항 제5호에 따라 청약철회가 제한됩니다.</p>
              <p>아이템상품별 수령 및 완료되기이전(다운로드·열람 기록이 없는 상태)에는 청약철회가 가능하며, 이미 결제된 금액은 영업일 기준 5일 이내 전액 환불합니다.</p>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">10. 개인정보보호</h4>
              <p>회원의 개인정보 보호에 관한 사항은 별도 게시된 개인정보처리방침에 따릅니다.</p>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">11. 지적재산권</h4>
              <p>서비스 및 DB 관련 저작권·상표권 등 모든 지적재산권은 회사 또는 정당한 권리자에게 귀속됩니다. 회원은 회사의 사전 서면 동의 없이 이러한 권리를 침해하거나 영리 목적으로 이용할 수 없습니다.</p>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">12. 면책</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>회사는 천재지변·전쟁·IDC 장애 등 불가항력으로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
                <li>회사는 회원의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">13. 분쟁해결 및 관할</h4>
              <p>회사와 회원은 서비스 이용과 관련하여 분쟁이 발생할 경우, 상호 협의하여 해결을 도모합니다. 협의가 이루어지지 않을 때에는 전자상거래분쟁조정위원회, 한국인터넷진흥원(KISA) 분쟁조정 등을 통한 조정 신청이 가능합니다. 최종적으로 소송이 제기될 경우 관할법원은 민사소송법이 정하는 법원을 따릅니다.</p>

              <h4 className="font-semibold text-gray-900 mt-6 mb-2">14. 부칙</h4>
              <p>이 약관은 2025년 9월 10일부터 적용됩니다.</p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            확인완료하고닫기
          </button>
        </div>
      </div>
    </div>
  );
};

