import type { BirthInput, FiveElementCount } from './types';
import { calculateSajuPillars } from './sajuUtils';
import { countFiveElements, getDominantElement } from './elements';

export interface SajuBase {
  pillars: { year: string; month: string; day: string; hour: string };
  elements: FiveElementCount;
  dominantElement: string;
}

/**
 * 사주 8글자(원국) 산출 — 순수 계산 엔진. AI는 이 결과를 절대 재계산하지 않고
 * 해석만 담당한다는 것이 서비스의 핵심 원칙이라, 계산은 항상 브라우저에서 끝낸다.
 */
export function calculateSajuBase(input: BirthInput): SajuBase {
  const pillarsRaw = calculateSajuPillars(
    input.year,
    input.month,
    input.day,
    input.timeUnknown ? 12 : input.hour,
    input.timeUnknown ? 0 : input.minute,
    input.isLunar,
    input.longitude
  );

  const pillars = {
    year: pillarsRaw.year,
    month: pillarsRaw.month,
    day: pillarsRaw.day,
    hour: pillarsRaw.hour,
  };

  const elements = countFiveElements(pillars);
  const dominantElement = getDominantElement(elements);

  return { pillars, elements, dominantElement };
}
