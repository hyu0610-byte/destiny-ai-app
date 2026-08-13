import type { BirthInput, SajuMode, SajuReading } from './types';
import { calculateSajuPillars } from './sajuUtils';
import { countFiveElements, getDominantElement } from './elements';

const TAROT_CARDS = [
  { name: '연인 (The Lovers)', keyword: '사랑과 선택', message: '마음이 이끄는 쪽으로 한 발짝 다가가도 좋은 타이밍이에요. 관계에서 솔직한 선택이 좋은 결과로 이어져요.' },
  { name: '전차 (The Chariot)', keyword: '승리와 전진', message: '망설이던 일이 있다면 지금이 밀어붙일 때예요. 속도감 있게 움직이면 원하는 방향으로 흘러가요.' },
  { name: '힘 (Strength)', keyword: '용기와 내면의 힘', message: '겉으로 세게 밀어붙이기보다, 차분하게 버티는 힘이 이번 판을 뒤집어요. 자신을 믿어도 좋아요.' },
  { name: '별 (The Star)', keyword: '희망과 회복', message: '최근 지쳤던 마음이 서서히 풀리는 시기예요. 작은 목표부터 다시 세워보면 좋은 흐름이 이어져요.' },
  { name: '태양 (The Sun)', keyword: '성취와 활력', message: '숨기지 않아도 되는 시기예요. 자신 있게 드러낼수록 주변에서 좋은 반응이 따라와요.' },
];

function pickTarotCard(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return TAROT_CARDS[hash % TAROT_CARDS.length];
}

function buildTraditional(input: BirthInput, pillars: SajuReading['pillars'], dominant: string): Pick<SajuReading, 'title' | 'summary' | 'sections' | 'advice'> {
  const dayStem = pillars.day[0];
  return {
    title: `${input.name}님의 사주 원국 풀이`,
    summary: `${input.name}님의 일간(日干)은 '${dayStem}'이며, 오행 중 ${dominant} 기운이 가장 두드러진 명식입니다. 확정된 사주 8글자를 기준으로 정통 명리학 해석을 전해드립니다.`,
    sections: [
      { heading: '타고난 본성', body: `일주 ${pillars.day}를 중심으로 볼 때, ${input.name}님은 자기 중심이 뚜렷하고 상황을 냉정하게 판단하는 기질을 타고났습니다. ${dominant} 기운이 강해 그 방향의 특성이 두드러지게 나타납니다.` },
      { heading: '오행의 조화', body: `연주 ${pillars.year}, 월주 ${pillars.month}, 일주 ${pillars.day}, 시주 ${pillars.hour}가 어우러져 균형점을 찾아가는 흐름입니다. 부족한 오행을 보완하면 전체적인 기운이 한층 안정됩니다.` },
      { heading: '인생 조언', body: `조급하게 결과를 좇기보다, 확정된 원국이 보여주는 흐름을 믿고 꾸준히 나아가는 태도가 필요한 시기입니다.` },
    ],
    advice: '부족한 오행을 색상과 생활 습관으로 보완하면 운의 흐름이 한결 부드러워집니다.',
  };
}

function buildDaily(input: BirthInput, pillars: SajuReading['pillars']): Pick<SajuReading, 'title' | 'summary' | 'sections' | 'advice'> {
  const dayBranch = pillars.day[1];
  return {
    title: `${input.name}님의 오늘의 운세`,
    summary: `오늘은 일지(日支) '${dayBranch}'의 기운이 활성화되는 날입니다. 실행력이 필요한 결정에 유리한 흐름이 감지됩니다.`,
    sections: [
      { heading: '오늘의 일(業)', body: '미뤄뒀던 업무를 처리하기 좋은 흐름입니다. 특히 오전 시간대에 집중력이 높게 유지됩니다.' },
      { heading: '오늘의 관계', body: '가까운 사람과의 대화에서 예상보다 솔직한 이야기가 오갈 수 있습니다. 감정적으로 반응하기보다 한 박자 쉬고 답하는 편이 좋습니다.' },
      { heading: '오늘의 선택', body: '두 가지 선택지 사이에서 고민된다면, 더 오래 준비해온 쪽을 택하는 것이 유리합니다.' },
    ],
    advice: '오늘은 새로운 걸 벌리기보다, 이미 진행 중인 일을 마무리하는 데 집중해보세요.',
  };
}

function buildTarot(input: BirthInput, pillars: SajuReading['pillars']): Pick<SajuReading, 'title' | 'summary' | 'sections' | 'advice'> {
  const card = pickTarotCard(`${input.name}-${pillars.day}-${Date.now()}`);
  return {
    title: `${input.name}님이 뽑은 카드: ${card.name}`,
    summary: `오늘 ${input.name}님을 위해 뽑힌 카드는 '${card.name}'입니다. 키워드는 '${card.keyword}'예요.`,
    sections: [
      { heading: '카드 메시지', body: card.message },
      { heading: 'MZ 코멘트', body: `지금 흐름 나쁘지 않아요. ${card.keyword} 쪽으로 에너지가 몰려있는 타이밍이니까, 눈치 보지 말고 밀어붙여도 괜찮아요.` },
    ],
    advice: '오늘 하루, 이 카드의 메시지를 마음 한켠에 담아두고 움직여보세요.',
  };
}

export function generateSajuReading(input: BirthInput, mode: SajuMode): SajuReading {
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
  const dominant = getDominantElement(elements);

  const content =
    mode === 'traditional' ? buildTraditional(input, pillars, dominant) :
    mode === 'daily' ? buildDaily(input, pillars) :
    buildTarot(input, pillars);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    input,
    mode,
    pillars,
    elements,
    dominantElement: dominant,
    ...content,
  };
}
