import type { TemplateKey } from './types'

export const TEMPLATE_OPTIONS = [
  {
    value: 'authentic-finance' as TemplateKey,
    label: '어센틱 금융그룹',
    description: '블랙/딥네이비 기반 프리미엄 금융 전문가 디자인',
  },
  {
    value: 'minimal-dark' as TemplateKey,
    label: '미니멀 다크',
    description: '심플하고 모던한 다크 테마',
  },
]

export const DEFAULT_TEMPLATE_KEY: TemplateKey = 'authentic-finance'
