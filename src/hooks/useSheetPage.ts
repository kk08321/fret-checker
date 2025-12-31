import { useEffect, useRef, useState } from "react";
import { convertNoteToGuitarPositions } from "../utils/midi";

interface Coordinates {
  x: number;
  y: number;
}

export const useSheetPage = () => {
  const [touchCoordinates, setTouchCoordinates] = useState<Coordinates | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [sheetWrapperHeight, setSheetWrapperHeight] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);
  
  const pageWrapperRef = useRef<HTMLDivElement>(null);
  const controlWrapperRef = useRef<HTMLDivElement>(null);

  const setCoordinatesByTouchEvent = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchCoordinates({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // 楽譜部分の高さを動的に設定
  useEffect(() => {
    if (pageWrapperRef.current && controlWrapperRef.current) {
      setSheetWrapperHeight(
        pageWrapperRef.current.getBoundingClientRect().height -
          controlWrapperRef.current.getBoundingClientRect().height
      );
    }
  }, [selectedNote]);

  const onEnter = () => {
    let notesCopy: string[] = [];
    if (notes.length < 6) {
      notesCopy = [...notes];
    }
    if (selectedNote !== null) {
      const guitarPosition = convertNoteToGuitarPositions(selectedNote);
      notesCopy.push(guitarPosition);
    }
    setNotes(notesCopy);
    setTouchCoordinates({ x: 0, y: -100 });
  };

  return {
    touchCoordinates,
    selectedNote,
    setSelectedNote,
    sheetWrapperHeight,
    notes,
    pageWrapperRef,
    controlWrapperRef,
    setCoordinatesByTouchEvent,
    onEnter,
  };
};

