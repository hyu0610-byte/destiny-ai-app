import type { BirthInput, SajuMode } from './types';
import type { SajuBase } from './sajuCalculation';
import { apiRequest } from './apiClient';

export interface AIInterpretation {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  advice: string;
}

/**
 * 계산된 사주 8글자를 서버로 보내 AI 해석을 요청한다.
 * 서버(OpenAI)는 이 pillars/elements 값을 그대로 신뢰하고 해석만 생성하며, 재계산하지 않는다.
 */
export async function requestAIInterpretation(input: BirthInput, mode: SajuMode, base: SajuBase): Promise<AIInterpretation> {
  const data = await apiRequest<{ interpretation: AIInterpretation }>('/api/interpret', {
    method: 'POST',
    body: {
      mode,
      input: { name: input.name, gender: input.gender, timeUnknown: input.timeUnknown },
      pillars: base.pillars,
      elements: base.elements,
      dominantElement: base.dominantElement,
    },
  });
  return data.interpretation;
}
