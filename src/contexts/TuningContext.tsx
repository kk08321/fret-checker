import { createContext, useContext, useState, ReactNode } from "react";

export type TuningType = "normal" | "dropD";

interface TuningContextType {
  tuning: TuningType;
  setTuning: (tuning: TuningType) => void;
}

const TuningContext = createContext<TuningContextType | undefined>(undefined);

export const TuningProvider = ({ children }: { children: ReactNode }) => {
  const [tuning, setTuning] = useState<TuningType>("normal");

  return (
    <TuningContext.Provider value={{ tuning, setTuning }}>
      {children}
    </TuningContext.Provider>
  );
};

export const useTuning = () => {
  const context = useContext(TuningContext);
  if (context === undefined) {
    throw new Error("useTuning must be used within a TuningProvider");
  }
  return context;
};

