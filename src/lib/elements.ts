import type { FiveElementCount } from './types';

const STEM_ELEMENT: Record<string, keyof FiveElementCount> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

const BRANCH_ELEMENT: Record<string, keyof FiveElementCount> = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
};

export const ELEMENT_LABEL: Record<keyof FiveElementCount, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

export function countFiveElements(pillars: { year: string; month: string; day: string; hour: string }): FiveElementCount {
  const counts: FiveElementCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  Object.values(pillars).forEach((pillar) => {
    const stem = pillar[0];
    const branch = pillar[1];
    if (STEM_ELEMENT[stem]) counts[STEM_ELEMENT[stem]] += 1;
    if (BRANCH_ELEMENT[branch]) counts[BRANCH_ELEMENT[branch]] += 1;
  });
  return counts;
}

export function getDominantElement(counts: FiveElementCount): string {
  const entries = Object.entries(counts) as [keyof FiveElementCount, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return ELEMENT_LABEL[entries[0][0]];
}
