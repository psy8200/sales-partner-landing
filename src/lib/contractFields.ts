import { ItemCategory } from '@prisma/client';

// 아이템별 필드 정의
export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ItemFieldConfig {
  required: FieldDefinition[];
  optional: FieldDefinition[];
}

export const ITEM_FIELDS: Record<ItemCategory, ItemFieldConfig> = {
  INSURANCE: {
    required: [
      {
        name: 'policyNumber',
        label: '증권번호',
        type: 'text',
        required: true,
        placeholder: '증권번호를 입력하세요'
      },
      {
        name: 'productDetail',
        label: '상품세부정보',
        type: 'textarea',
        required: true,
        placeholder: '상품의 세부 정보를 입력하세요'
      },
      {
        name: 'policyholder',
        label: '계약자명',
        type: 'text',
        required: true,
        placeholder: '계약자명을 입력하세요'
      },
      {
        name: 'insured',
        label: '피보험자명',
        type: 'text',
        required: true,
        placeholder: '피보험자명을 입력하세요'
      },
      {
        name: 'contractMethod',
        label: '계약체결방법(어디서/어떻게)',
        type: 'textarea',
        required: true,
        placeholder: '예: 대면/비대면, 지점/온라인 등 체결 경로와 방식'
      }
    ],
    optional: []
  },
  RENTAL: {
    required: [
      {
        name: 'rentalCompany',
        label: '렌탈사',
        type: 'text',
        required: true,
        placeholder: '렌탈사명을 입력하세요'
      },
      {
        name: 'productDetail',
        label: '상품명세부정보',
        type: 'text',
        required: true,
        placeholder: '상품의 세부 정보를 입력하세요'
      }
    ],
    optional: [
      {
        name: 'installationAddress',
        label: '설치상세주소',
        type: 'text',
        required: false,
        placeholder: '설치할 상세주소를 입력하세요'
      },
      {
        name: 'recipientName',
        label: '설치받는분이름',
        type: 'text',
        required: false,
        placeholder: '설치받는 분의 이름을 입력하세요'
      },
      {
        name: 'recipientPhone',
        label: '받는분연락처',
        type: 'text',
        required: false,
        placeholder: '받는 분의 연락처를 입력하세요'
      },
      {
        name: 'installationDate',
        label: '설치완료일',
        type: 'date',
        required: false,
        placeholder: '설치완료 예정일을 선택하세요'
      },
      {
        name: 'notes',
        label: '메모',
        type: 'textarea',
        required: false,
        placeholder: '추가 메모사항을 입력하세요'
      }
    ]
  },
  INTERNET_TV: {
    required: [
      {
        name: 'productDetail',
        label: '상세상품정보',
        type: 'text',
        required: true,
        placeholder: '상품의 세부 정보를 입력하세요'
      },
      {
        name: 'recipientName',
        label: '설치받는분이름',
        type: 'text',
        required: true,
        placeholder: '설치받는 분의 이름을 입력하세요'
      },
      {
        name: 'recipientPhone',
        label: '설치받는분연락처',
        type: 'text',
        required: true,
        placeholder: '받는 분의 연락처를 입력하세요'
      },
      {
        name: 'installationDate',
        label: '설치완료일',
        type: 'date',
        required: true,
        placeholder: '설치완료 예정일을 선택하세요'
      }
    ],
    optional: [
      {
        name: 'notes',
        label: '메모',
        type: 'textarea',
        required: false,
        placeholder: '추가 메모사항을 입력하세요'
      }
    ]
  },
  FUNERAL: {
    required: [
      {
        name: 'policyNumber',
        label: '증권번호',
        type: 'text',
        required: true,
        placeholder: '증권번호를 입력하세요'
      },
      {
        name: 'contractorName',
        label: '계약자명',
        type: 'text',
        required: true,
        placeholder: '계약자명을 입력하세요'
      },
      {
        name: 'insuredPerson',
        label: '피보험자명',
        type: 'text',
        required: true,
        placeholder: '피보험자명을 입력하세요'
      },
      {
        name: 'bundleProductName',
        label: '결합사은품명',
        type: 'text',
        required: true,
        placeholder: '결합사은품명을 입력하세요'
      }
    ],
    optional: [
      {
        name: 'notes',
        label: '메모',
        type: 'textarea',
        required: false,
        placeholder: '추가 메모사항을 입력하세요'
      }
    ]
  },
  RENTAL_MALL: {
    required: [
      {
        name: 'mallName',
        label: '쇼핑몰명',
        type: 'text',
        required: true,
        placeholder: '쇼핑몰명을 입력하세요'
      },
      {
        name: 'productDetail',
        label: '상품세부정보',
        type: 'textarea',
        required: true,
        placeholder: '상품의 세부 정보를 입력하세요'
      }
    ],
    optional: [
      {
        name: 'notes',
        label: '메모',
        type: 'textarea',
        required: false,
        placeholder: '추가 메모사항을 입력하세요'
      }
    ]
  },
  CUSTOM: {
    required: [
      {
        name: 'customField1',
        label: '커스텀 필드 1',
        type: 'text',
        required: true,
        placeholder: '커스텀 필드를 입력하세요'
      }
    ],
    optional: [
      {
        name: 'notes',
        label: '메모',
        type: 'textarea',
        required: false,
        placeholder: '추가 메모사항을 입력하세요'
      }
    ]
  }
};

// 아이템별 필드 가져오기
export function getItemFields(category: ItemCategory): ItemFieldConfig {
  return ITEM_FIELDS[category] || ITEM_FIELDS.INSURANCE;
}

// 모든 필수 필드 가져오기
export function getRequiredFields(category: ItemCategory): FieldDefinition[] {
  return getItemFields(category).required;
}

// 모든 선택 필드 가져오기
export function getOptionalFields(category: ItemCategory): FieldDefinition[] {
  return getItemFields(category).optional;
}

// 모든 필드 가져오기 (필수 + 선택)
export function getAllFields(category: ItemCategory): FieldDefinition[] {
  const fields = getItemFields(category);
  return [...fields.required, ...fields.optional];
}

// 필드 유효성 검사
export function validateDynamicFields(
  category: ItemCategory, 
  dynamicData: Record<string, unknown>
): { isValid: boolean; errors: string[] } {
  const requiredFields = getRequiredFields(category);
  const errors: string[] = [];

  requiredFields.forEach(field => {
    const value = dynamicData[field.name];
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${field.label}은(는) 필수 입력 항목입니다.`);
    }
    
    if (field.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${field.label}은(는) 숫자로 입력해주세요.`);
      } else if (field.min !== undefined && numValue < field.min) {
        errors.push(`${field.label}은(는) ${field.min} 이상으로 입력해주세요.`);
      } else if (field.max !== undefined && numValue > field.max) {
        errors.push(`${field.label}은(는) ${field.max} 이하로 입력해주세요.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 아이템 카테고리별 한글명
export function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    INSURANCE: '보험상담신청',
    RENTAL: '렌탈상품신청',
    INTERNET_TV: '인터넷+TV 결합상품신청',
    FUNERAL: '상조결합상품신청',
    RENTAL_MALL: '렌탈쇼핑몰신청',
    CUSTOM: '커스텀상품신청'
  };
  return labels[category] || category;
}
