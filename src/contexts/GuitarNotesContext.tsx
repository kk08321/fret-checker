import { createContext, useContext, useState, ReactNode } from "react";

interface GuitarNotesContextType {
  inputtedNoteNumbers: string[];
  setInputtedNoteNumbers: (notes: string[]) => void;
}

const GuitarNotesContext = createContext<GuitarNotesContextType | undefined>(undefined);

export const GuitarNotesProvider = ({ children }: { children: ReactNode }) => {
  const [inputtedNoteNumbers, setInputtedNoteNumbers] = useState<string[]>([]);

  return (
    <GuitarNotesContext.Provider value={{ inputtedNoteNumbers, setInputtedNoteNumbers }}>
      {children}
    </GuitarNotesContext.Provider>
  );
};

export const useGuitarNotes = () => {
  const context = useContext(GuitarNotesContext);
  if (context === undefined) {
    throw new Error("useGuitarNotes must be used within a GuitarNotesProvider");
  }
  return context;
};

