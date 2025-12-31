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
  const [inputtedNoteNumbers, setInputtedNoteNumbers] = useState<string[]>([]);
  
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
    // タッチ位置がControlPanelの範囲内かチェック
    if (controlWrapperRef.current && touchCoordinates) {
      const controlRect = controlWrapperRef.current.getBoundingClientRect();
      if (
        touchCoordinates.x >= controlRect.left &&
        touchCoordinates.x <= controlRect.right &&
        touchCoordinates.y >= controlRect.top &&
        touchCoordinates.y <= controlRect.bottom
      ) {
        // ControlPanelの範囲内の場合はnote入力をスキップ
        setTouchCoordinates({ x: 0, y: -100 });
        return;
      }
    }

    // タッチ位置がBarの範囲内かチェック（sheetWrapperの範囲内か）
    if (pageWrapperRef.current && touchCoordinates) {
      const pageRect = pageWrapperRef.current.getBoundingClientRect();
      const controlRect = controlWrapperRef.current?.getBoundingClientRect();
      
      // Barの範囲は、pageWrapperからcontrolWrapperを除いた部分
      const barTop = pageRect.top;
      const barBottom = controlRect ? controlRect.top : pageRect.bottom;
      
      if (
        touchCoordinates.y < barTop ||
        touchCoordinates.y > barBottom
      ) {
        // Barの範囲外の場合はnote入力をスキップ
        setTouchCoordinates({ x: 0, y: -100 });
        return;
      }
    }

    let notesCopy: string[] = [];
    let noteNumbersCopy: string[] = [];
    if (notes.length < 6) {
      notesCopy = [...notes];
      noteNumbersCopy = [...inputtedNoteNumbers];
    }
    if (selectedNote !== null) {
      const guitarPosition = convertNoteToGuitarPositions(selectedNote);
      notesCopy.push(guitarPosition);
      noteNumbersCopy.push(selectedNote);
    }
    setNotes(notesCopy);
    setInputtedNoteNumbers(noteNumbersCopy);
    setTouchCoordinates({ x: 0, y: -100 });
  };

  return {
    touchCoordinates,
    selectedNote,
    setSelectedNote,
    sheetWrapperHeight,
    notes,
    inputtedNoteNumbers,
    pageWrapperRef,
    controlWrapperRef,
    setCoordinatesByTouchEvent,
    onEnter,
  };
};

