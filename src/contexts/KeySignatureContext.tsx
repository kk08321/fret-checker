import { createContext, useContext, useState, ReactNode } from "react";
import { KeySignatureType } from "../utils/keySignature";

interface KeySignatureContextType {
  selectedKeySignature: KeySignatureType | null;
  setSelectedKeySignature: (key: KeySignatureType | null) => void;
}

const KeySignatureContext = createContext<KeySignatureContextType | undefined>(undefined);

export const KeySignatureProvider = ({ children }: { children: ReactNode }) => {
  const [selectedKeySignature, setSelectedKeySignature] = useState<KeySignatureType | null>(null);

  return (
    <KeySignatureContext.Provider value={{ selectedKeySignature, setSelectedKeySignature }}>
      {children}
    </KeySignatureContext.Provider>
  );
};

export const useKeySignature = () => {
  const context = useContext(KeySignatureContext);
  if (context === undefined) {
    throw new Error("useKeySignature must be used within a KeySignatureProvider");
  }
  return context;
};

