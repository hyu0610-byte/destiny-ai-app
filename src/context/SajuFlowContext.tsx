import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BirthInput, SajuMode, SajuReading } from '../lib/types';

interface SajuFlowContextValue {
  input: BirthInput | null;
  setInput: (input: BirthInput) => void;
  mode: SajuMode | null;
  setMode: (mode: SajuMode) => void;
  reading: SajuReading | null;
  setReading: (reading: SajuReading | null) => void;
}

const SajuFlowContext = createContext<SajuFlowContextValue | null>(null);

export function SajuFlowProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<BirthInput | null>(null);
  const [mode, setMode] = useState<SajuMode | null>(null);
  const [reading, setReading] = useState<SajuReading | null>(null);

  return (
    <SajuFlowContext.Provider value={{ input, setInput, mode, setMode, reading, setReading }}>
      {children}
    </SajuFlowContext.Provider>
  );
}

export function useSajuFlow() {
  const ctx = useContext(SajuFlowContext);
  if (!ctx) throw new Error('useSajuFlow must be used within SajuFlowProvider');
  return ctx;
}
