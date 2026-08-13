export type SajuMode = 'traditional' | 'daily' | 'tarot';

export interface BirthInput {
  name: string;
  gender: '남' | '여';
  year: number;
  month: number;
  day: number;
  isLunar: boolean;
  timeUnknown: boolean;
  hour: number;
  minute: number;
  locationName: string;
  longitude: number;
}

export interface FiveElementCount {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface SajuReading {
  id: string;
  createdAt: string;
  input: BirthInput;
  mode: SajuMode;
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  elements: FiveElementCount;
  dominantElement: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  advice: string;
}
