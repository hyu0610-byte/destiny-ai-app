interface StepTrackProps {
  current: number;
}

const STEPS = ['정보 입력', '모드 선택', '결과 확인'];

export default function StepTrack({ current }: StepTrackProps) {
  return (
    <div className="step-track" aria-label="진행 단계">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const state = stepNum < current ? 'done' : stepNum === current ? 'active' : '';
        return (
          <span key={label} style={{ display: 'contents' }}>
            <span className={`dot ${state}`}>
              <span className="num">{stepNum < current ? '✓' : stepNum}</span>
              {label}
            </span>
            {stepNum < STEPS.length && <span className="sep" aria-hidden="true" />}
          </span>
        );
      })}
    </div>
  );
}
