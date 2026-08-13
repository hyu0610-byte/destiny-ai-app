import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import StepTrack from '../components/ui/StepTrack';
import Card from '../components/ui/Card';
import { useSajuFlow } from '../context/SajuFlowContext';
import { KOREA_LOCATIONS } from '../lib/locations';
import type { BirthInput } from '../lib/types';

type Errors = Partial<Record<'name' | 'year' | 'month' | 'day' | 'hour' | 'minute', string>>;

export default function InputPage() {
  const navigate = useNavigate();
  const { input, setInput } = useSajuFlow();

  const [name, setName] = useState(input?.name ?? '');
  const [gender, setGender] = useState<'남' | '여'>(input?.gender ?? '여');
  const [isLunar, setIsLunar] = useState(input?.isLunar ?? false);
  const [year, setYear] = useState(String(input?.year ?? ''));
  const [month, setMonth] = useState(String(input?.month ?? ''));
  const [day, setDay] = useState(String(input?.day ?? ''));
  const [timeUnknown, setTimeUnknown] = useState(input?.timeUnknown ?? false);
  const [hour, setHour] = useState(String(input?.hour ?? ''));
  const [minute, setMinute] = useState(String(input?.minute ?? '0'));
  const [locationName, setLocationName] = useState(input?.locationName ?? KOREA_LOCATIONS[0].name);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = '이름을 입력해 주세요.';

    const y = Number(year), m = Number(month), d = Number(day);
    if (!y || y < 1900 || y > 2026) next.year = '연도를 확인해 주세요.';
    if (!m || m < 1 || m > 12) next.month = '월을 1~12 사이로 입력해 주세요.';
    if (!d || d < 1 || d > 31) next.day = '일을 1~31 사이로 입력해 주세요.';

    if (!timeUnknown) {
      const h = Number(hour), min = Number(minute);
      if (hour === '' || h < 0 || h > 23) next.hour = '시간을 0~23 사이로 입력해 주세요.';
      if (minute === '' || min < 0 || min > 59) next.minute = '분을 0~59 사이로 입력해 주세요.';
    }
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const location = KOREA_LOCATIONS.find((l) => l.name === locationName) ?? KOREA_LOCATIONS[0];

    const value: BirthInput = {
      name: name.trim(),
      gender,
      year: Number(year),
      month: Number(month),
      day: Number(day),
      isLunar,
      timeUnknown,
      hour: timeUnknown ? 12 : Number(hour),
      minute: timeUnknown ? 0 : Number(minute),
      locationName: location.name,
      longitude: location.lon,
    };

    setInput(value);
    navigate('/modes');
  };

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <StepTrack current={1} />
      <Card>
        <h2 style={{ marginBottom: 4 }}>정보 입력</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', marginBottom: 24 }}>
          입력한 정보로 사주 8글자를 정확히 계산합니다. 출생시간을 모르면 아래 체크박스를 선택해 주세요.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="홍길동" />

          <div className="field">
            <label>성별</label>
            <div className="segmented">
              <button type="button" className={gender === '여' ? 'active' : ''} onClick={() => setGender('여')}>여</button>
              <button type="button" className={gender === '남' ? 'active' : ''} onClick={() => setGender('남')}>남</button>
            </div>
          </div>

          <div className="field">
            <label>양력 / 음력</label>
            <div className="segmented">
              <button type="button" className={!isLunar ? 'active' : ''} onClick={() => setIsLunar(false)}>양력</button>
              <button type="button" className={isLunar ? 'active' : ''} onClick={() => setIsLunar(true)}>음력</button>
            </div>
          </div>

          <div className="field">
            <label>생년월일</label>
            <div className="row">
              <input className={`input ${errors.year ? 'input-error' : ''}`} type="number" inputMode="numeric" placeholder="연도(YYYY)" value={year} onChange={(e) => setYear(e.target.value)} aria-label="출생 연도" />
              <input className={`input ${errors.month ? 'input-error' : ''}`} type="number" inputMode="numeric" placeholder="월" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="출생 월" />
              <input className={`input ${errors.day ? 'input-error' : ''}`} type="number" inputMode="numeric" placeholder="일" value={day} onChange={(e) => setDay(e.target.value)} aria-label="출생 일" />
            </div>
            {(errors.year || errors.month || errors.day) && (
              <p className="error-text" role="alert">{errors.year || errors.month || errors.day}</p>
            )}
          </div>

          <div className="field">
            <label className="checkbox-row">
              <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
              출생시간을 모릅니다
            </label>
          </div>

          {!timeUnknown && (
            <div className="field">
              <label>출생시간</label>
              <div className="row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <input className={`input ${errors.hour ? 'input-error' : ''}`} type="number" inputMode="numeric" placeholder="시(0~23)" value={hour} onChange={(e) => setHour(e.target.value)} aria-label="출생 시" />
                <input className={`input ${errors.minute ? 'input-error' : ''}`} type="number" inputMode="numeric" placeholder="분(0~59)" value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="출생 분" />
              </div>
              {(errors.hour || errors.minute) && (
                <p className="error-text" role="alert">{errors.hour || errors.minute}</p>
              )}
            </div>
          )}

          {timeUnknown && (
            <p className="feedback-text" style={{ marginBottom: 18 }}>
              출생시간이 없으면 정밀 사주(전통 사주) 모드는 제한되고, 오늘의 운세·타로만 이용할 수 있어요.
            </p>
          )}

          <Select label="출생지" value={locationName} onChange={(e) => setLocationName(e.target.value)}>
            {KOREA_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </Select>

          <Button type="submit" block>다음: 해석 모드 선택</Button>
        </form>
      </Card>
    </div>
  );
}
