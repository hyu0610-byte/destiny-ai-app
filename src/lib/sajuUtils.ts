
import { Solar, Lunar } from "lunar-javascript";
import { getTotalCorrection, type TimeCorrectionBreakdown } from "./timeCorrection";

export const SAJU_ENGINE_VERSION = "v1.1.0";

export interface SajuPillars {
  year: string;
  month: string;
  day: string;
  hour: string;
  debug?: SajuDebugInfo;
}

export interface SajuDebugInfo {
  engineVersion: string;
  originalInput: string;
  normalizedInput?: string;
  normalizationRule?: string;
  birthTimestamp: string;
  solarTermTimestamp: string;
  solarTermRule: string;
  solarTermResult: string;
  correctedTime: string;
  correction: TimeCorrectionBreakdown;
  stdMeridian?: number;
  isJeongJaSi: boolean;
  isLeapMonth?: boolean;
  leapMonthInfo?: string;
  jdn: number;
  jdnFormula: string;
  dayIndex: number;
  finalDay: string;
  solarTerm: string;
  termEntry: string;
  eightChars: string;
  timezone?: string;
  timeAudit: {
    status: "valid" | "nonexistent" | "ambiguous" | "audit_error";
    details?: string;
  };
}

const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const SEXAGENARY_CYCLE = Array.from({ length: 60 }, (_, i) => 
  HEAVENLY_STEMS[i % 10] + EARTHLY_BRANCHES[i % 12]
);

/**
 * Calculates Gregorian Julian Day Number
 */
function getJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

/**
 * Deterministically calculates Saju pillars.
 */
export function calculateSajuPillars(
  year: number, 
  month: number, 
  day: number, 
  hour: number, 
  minute: number, 
  isLunar: boolean,
  longitude: number = 126.98, // SEOUL Default
  stdMeridian: number = 135,
  second: number = 0,
  isLeapMonth: boolean = false,
  timezone: string = "Asia/Seoul"
): SajuPillars {
  // Handle 24:00 defense (Case 15)
  let normalizedDate = { y: year, m: month, d: day, h: hour, min: minute, s: second };
  let normalizationRule = "None";
  let normalizedInput = "";

  if (hour === 24) {
    // 24:00 is next day 00:00
    const nextDay = Solar.fromYmdHms(year, month, day, 0, 0, 0).next(1);
    normalizedDate = {
      y: nextDay.getYear(),
      m: nextDay.getMonth(),
      d: nextDay.getDay(),
      h: 0,
      min: minute,
      s: second
    };
    normalizationRule = "24:00 = next day 00:00";
    normalizedInput = `${normalizedDate.y}-${normalizedDate.m}-${normalizedDate.d} 00:${minute}:${second}`;
  }

  // 1. Precise Time Correction
  const correction = getTotalCorrection(
    normalizedDate.y, 
    normalizedDate.m, 
    normalizedDate.d, 
    normalizedDate.h, 
    normalizedDate.min, 
    longitude, 
    stdMeridian
  );
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let kstBase: any;
  if (isLunar) {
    // Note: lunar-javascript leap handling: Use negative month for leap.
    const lunarMonth = isLeapMonth ? -normalizedDate.m : normalizedDate.m;
    const lunar = Lunar.fromYmd(normalizedDate.y, lunarMonth, normalizedDate.d);
    const solarTemp = lunar.getSolar();
    kstBase = Solar.fromYmdHms(solarTemp.getYear(), solarTemp.getMonth(), solarTemp.getDay(), normalizedDate.h, normalizedDate.min, normalizedDate.s);
  } else {
    kstBase = Solar.fromYmdHms(normalizedDate.y, normalizedDate.m, normalizedDate.d, normalizedDate.h, normalizedDate.min, normalizedDate.s);
  }

  // Apply total correction to get Mean Solar Time
  const correctedMoment = Solar.fromJulianDay(kstBase.getJulianDay() + correction.total / (24 * 60));
  const cy = correctedMoment.getYear();
  const cm = correctedMoment.getMonth();
  const cd = correctedMoment.getDay();
  const ch = correctedMoment.getHour();
  const cmin = correctedMoment.getMinute();

  // 2. Year & Month Pillar (Based on Solar Term Entry Time)
  // We use the library's internal EightChar calculation.
  // The library uses 120 E (Beijing) as standard, so we must shift KST (135 E) back by 1 hour.
  const bjSolar = Solar.fromJulianDay(kstBase.getJulianDay() - 1 / 24);
  const lunar = bjSolar.getLunar();
  const eightChar = lunar.getEightChar();
  
  // Validation for Case 12/13: Detect if the input local time is invalid or ambiguous in its timezone.
  let timeAudit: SajuDebugInfo["timeAudit"] = { status: "valid" };
  try {
    const checkDate = new Date(normalizedDate.y, normalizedDate.m - 1, normalizedDate.d, normalizedDate.h, normalizedDate.min);
    if (checkDate.getHours() !== normalizedDate.h && normalizedDate.h !== 24) {
       timeAudit = { 
         status: "nonexistent", 
         details: "DST Transition - Local time does not exist in system timezone." 
       };
    }
  } catch (e) {
    timeAudit = { status: "audit_error", details: String(e) };
  }

  // Solar Term Comparison Details
  const birthKst = kstBase.toFullString();
  const currentJie = lunar.getJieQi(); 
  const jieQiTable = lunar.getJieQiTable();
  const termMoment = jieQiTable[currentJie] ? jieQiTable[currentJie].toFullString() : "N/A";
  const solarTermResult = currentJie ? `${currentJie} 이후 적용 (Month Stem/Branch updated)` : "절입 전";

  const leapMonthInfo = isLunar && isLeapMonth 
    ? "음력 윤달이 양력 날짜로 정확히 변환되었으며, 해당 날짜 기준으로 산출됨" 
    : "평달 (변환된 양력 기준)";

  const finalYear = eightChar.getYear();
  const finalMonth = eightChar.getMonth();

  // 3. Day Pillar Logic (JDN Based + Jeong-ja-si)
  // Jeong-ja-si condition: 23:30 KST ~ 00:30 KST
  // Since we already subtracted 30 mins, this corresponds to correctedTime (Solar) hour 23.
  const isJeongJaSi = (ch === 23);
  
  let jdnDate = { y: cy, m: cm, d: cd };
  if (isJeongJaSi) {
    const nextDay = Solar.fromJulianDay(correctedMoment.getJulianDay() + 1);
    jdnDate = { y: nextDay.getYear(), m: nextDay.getMonth(), d: nextDay.getDay() };
  }

  const jdn = getJDN(jdnDate.y, jdnDate.m, jdnDate.d);
  // Offset verified for 2000-09-08 = Gi-Sa (Index 5)
  // JDN 2451796. (2451796 + 49) % 60 = 5. Correct.
  // Offset verified for 1995-06-10 = Im-Shin (Index 8)
  // JDN 2449879. (2449879 + 49) % 60 = 8. Correct.
  const dayIndex = (jdn + 49) % 60;
  const finalDay = SEXAGENARY_CYCLE[dayIndex];

  // 4. Hour Pillar Logic
  // Using correctedTime to determine Branch, and Day Stem to determine Stem.
  // Branches: 子(23:00-01:00 solar), 丑(01:00-03:00 solar), etc.
  
  const getBranchIndex = (h: number) => {
    if (h >= 23 || h < 1) return 0; // 子
    return Math.floor((h + 1) / 2);
  };
  const branchIdx = getBranchIndex(ch);
  const hourBranch = EARTHLY_BRANCHES[branchIdx];

  // Si-du law: 
  const dayStem = finalDay[0];
  let startStemIdx = 0;
  if (["甲", "己"].includes(dayStem)) startStemIdx = 0; // 甲子
  else if (["乙", "庚"].includes(dayStem)) startStemIdx = 2; // 丙子
  else if (["丙", "辛"].includes(dayStem)) startStemIdx = 4; // 戊子
  else if (["丁", "壬"].includes(dayStem)) startStemIdx = 6; // 庚子
  else if (["戊", "癸"].includes(dayStem)) startStemIdx = 8; // 壬子
  
  const hourStem = HEAVENLY_STEMS[(startStemIdx + branchIdx) % 10];
  const finalHour = hourStem + hourBranch;

  let termEntryInfo = "N/A";
  for (const key in jieQiTable) {
    if (key === currentJie) {
      termEntryInfo = `${key} 절입: ${jieQiTable[key].toFullString()}`;
      break;
    }
  }

  return {
    year: finalYear,
    month: finalMonth,
    day: finalDay,
    hour: finalHour,
    debug: {
      engineVersion: SAJU_ENGINE_VERSION,
      originalInput: `${year}-${month}-${day} ${hour}:${minute}:${second} (KST)`,
      normalizedInput,
      normalizationRule,
      birthTimestamp: birthKst,
      solarTermTimestamp: termMoment,
      solarTermRule: "Birth Time >= Solar Term Time",
      solarTermResult,
      correctedTime: `${cy}-${cm}-${cd} ${ch}:${cmin} (TST)`,
      correction,
      stdMeridian,
      isJeongJaSi,
      isLeapMonth, 
      leapMonthInfo,
      jdn,
      jdnFormula: `(JDN ${jdn} + 49) % 60 = ${dayIndex}`,
      dayIndex,
      finalDay,
      solarTerm: currentJie || "None",
      termEntry: termEntryInfo,
      eightChars: `${finalYear} ${finalMonth} ${finalDay} ${finalHour}`,
      timezone,
      timeAudit
    }
  };
}

