
/**
 * Historical Standard Time and DST logic for South Korea.
 * Also handles regional longitude correction.
 */

interface DSTPeriod {
  start: Date;
  end: Date;
}

const KOREA_DST_PERIODS: DSTPeriod[] = [
  { start: new Date(1948, 5, 1, 0), end: new Date(1948, 8, 13, 0) },
  { start: new Date(1949, 3, 3, 0), end: new Date(1949, 8, 11, 0) },
  { start: new Date(1950, 3, 1, 0), end: new Date(1950, 8, 11, 0) },
  { start: new Date(1951, 4, 6, 0), end: new Date(1951, 8, 9, 0) },
  { start: new Date(1955, 4, 19, 0), end: new Date(1955, 8, 9, 0) },
  { start: new Date(1956, 4, 20, 0), end: new Date(1956, 8, 30, 0) },
  { start: new Date(1957, 4, 19, 0), end: new Date(1957, 8, 22, 0) },
  { start: new Date(1958, 4, 18, 0), end: new Date(1958, 8, 21, 0) },
  { start: new Date(1959, 4, 17, 0), end: new Date(1959, 8, 20, 0) },
  { start: new Date(1960, 4, 15, 0), end: new Date(1960, 8, 18, 0) },
  { start: new Date(1987, 4, 10, 2), end: new Date(1987, 9, 11, 3) },
  { start: new Date(1988, 4, 8, 2), end: new Date(1988, 9, 9, 3) },
];

/**
 * Checks if a given domestic time in Korea was under DST.
 * Returns -60 (minutes) if DST was active, otherwise 0.
 * Saju logic: Subtract 1 hour if DST was active.
 */
export function getDSTCorrection(year: number, month: number, day: number, hour: number, minute: number): number {
  const d = new Date(year, month - 1, day, hour, minute);
  const time = d.getTime();
  
  for (const period of KOREA_DST_PERIODS) {
    if (time >= period.start.getTime() && time < period.end.getTime()) {
      return -60; // Subtract 1 hour for Saju calculation
    }
  }
  return 0;
}

/**
 * Standard Meridian Correction for Korea.
 * Modern KOREA (since 1961) uses 135°E.
 * Standard Meridian history:
 * - 1908.04.01 ~ 1911.12.31: 127.5°E (UTC+8.5)
 * - 1912.01.01 ~ 1954.03.20: 135°E (UTC+9.0)
 * - 1954.03.21 ~ 1961.08.09: 127.5°E (UTC+8.5)
 * - 1961.08.10 ~ Present: 135°E (UTC+9.0)
 * 
 * Returns the standard meridian used at that time.
 */
export function getStandardMeridian(year: number, month: number, day: number): number {
  const dateNum = year * 10000 + month * 100 + day;
  
  if (dateNum < 19080401) return 127.0; // Approximation for pre-modern
  if (dateNum <= 19111231) return 127.5;
  if (dateNum <= 19540320) return 135.0;
  if (dateNum <= 19610809) return 127.5;
  return 135.0;
}

/**
 * Calculates the time correction in minutes based on longitude.
 * Formula: (BirthLongitude - StandardMeridian) * 4 minutes.
 * Default longitude for Seoul: 126.9780°E
 */
export function getLongitudeCorrection(birthLongitude: number, standardMeridian: number): number {
  return (birthLongitude - standardMeridian) * 4;
}

/**
 * Calculates the Equation of Time (E.T) in minutes.
 * Accounts for Earth's orbital eccentricity and axial tilt.
 * Formula yields the difference between True Solar Time and Mean Solar Time.
 */
export function getEquationOfTime(year: number, month: number, day: number): number {
  // Calculate day of the year (N)
  const start = new Date(year, 0, 0);
  const diff = new Date(year, month - 1, day).getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const N = Math.floor(diff / oneDay);

  // Mean anomaly (M) in degrees
  const M = 357.5291 + 0.98560028 * N;
  const Mrad = (M * Math.PI) / 180;

  // Mean longitude (L) in degrees
  const L = 280.4665 + 0.98564736 * N;

  // Obliquity of the ecliptic (epsilon) - approx 23.439 degrees
  const epsilon = 23.439 * (Math.PI / 180);

  // Equation of Time in degrees
  // E = L - alpha, where alpha is right ascension
  // More stable formula below for E in minutes:
  const y = Math.tan(epsilon / 2) * Math.tan(epsilon / 2);
  const E = y * Math.sin(2 * (L * Math.PI / 180)) 
          - 2 * 0.01671 * Math.sin(Mrad) 
          + 4 * 0.01671 * y * Math.sin(Mrad) * Math.cos(2 * (L * Math.PI / 180)) 
          - 0.5 * y * y * Math.sin(4 * (L * Math.PI / 180)) 
          - 1.25 * 0.01671 * 0.01671 * Math.sin(2 * Mrad);

  return (E * 180 / Math.PI) * 4; // Convert degrees to minutes (1 degree = 4 minutes)
}

export interface TimeCorrectionBreakdown {
  dst: number;
  longitude: number;
  equationOfTime: number;
  total: number;
}

/**
 * Combined correction helper.
 * Returns total minutes to add to the clock time to get True Solar Time (Jin-Tae-Yang-Si).
 */
export function getTotalCorrection(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number,
  stdMeridian: number = 135 // Default KST
): TimeCorrectionBreakdown {
  // Currently specialized for Korea. For global, stdMeridian and longitude are the primary drivers.
  // We apply the Korea historical DST rules ONLY if stdMeridian is 135 (KST).
  let dst = 0;
  if (stdMeridian === 135 || (longitude > 124 && longitude < 131)) {
    dst = getDSTCorrection(year, month, day, hour, minute);
  }
  
  const lonCorr = getLongitudeCorrection(longitude, stdMeridian);
  const eqTime = getEquationOfTime(year, month, day);
  
  return {
    dst,
    longitude: lonCorr,
    equationOfTime: eqTime,
    total: dst + lonCorr + eqTime
  };
}
