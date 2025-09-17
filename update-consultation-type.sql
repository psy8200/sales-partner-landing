-- 포인트추가 신청 데이터의 상담종류를 "포인트추가"로 업데이트
UPDATE PartnerApplication 
SET consultationType = '포인트추가' 
WHERE additionalNote LIKE '%선택된 아이템%';

-- 업데이트 결과 확인
SELECT id, additionalNote, consultationType, referrer, createdAt 
FROM PartnerApplication 
WHERE additionalNote LIKE '%선택된 아이템%' 
ORDER BY createdAt DESC;





