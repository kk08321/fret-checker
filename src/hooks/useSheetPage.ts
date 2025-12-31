import { useEffect, useRef, useState } from "react";
import { convertNoteToGuitarPositions } from "../utils/midi";
import { useGuitarNotes } from "../contexts/GuitarNotesContext";

interface Coordinates {
  x: number;
  y: number;
}

export const useSheetPage = () => {
  const [touchCoordinates, setTouchCoordinates] = useState<Coordinates | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [sheetWrapperHeight, setSheetWrapperHeight] = useState(0);
  const [isSharpMode, setIsSharpMode] = useState(false);
  const { inputtedNoteNumbers, setInputtedNoteNumbers } = useGuitarNotes();
  
  // inputtedNoteNumbersから動的にnotesを計算
  const notes = inputtedNoteNumbers.map(noteNumStr => convertNoteToGuitarPositions(noteNumStr));
  
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
        // ControlPanelの範囲内の場合はnote入力をスキップし、シャープモードをリセット
        setIsSharpMode(false);
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
        // Barの範囲外の場合はnote入力をスキップし、シャープモードをリセット
        setIsSharpMode(false);
        setTouchCoordinates({ x: 0, y: -100 });
        return;
      }
    }

    let noteNumbersCopy: string[] = [];
    if (inputtedNoteNumbers.length < 6) {
      noteNumbersCopy = [...inputtedNoteNumbers];
    }
    if (selectedNote !== null) {
      const noteToAdd = isSharpMode ? `${selectedNote}#` : selectedNote;
      noteNumbersCopy.push(noteToAdd);
      // シャープモードをリセット
      setIsSharpMode(false);
    }
    // コンテキストを更新（notesはinputtedNoteNumbersから自動的に計算される）
    setInputtedNoteNumbers(noteNumbersCopy);
    console.log("useSheetPage - updating inputtedNoteNumbers:", noteNumbersCopy);
    setTouchCoordinates({ x: 0, y: -100 });
  };

  return {
    touchCoordinates,
    setTouchCoordinates,
    selectedNote,
    setSelectedNote,
    sheetWrapperHeight,
    notes,
    inputtedNoteNumbers,
    setInputtedNoteNumbers,
    pageWrapperRef,
    controlWrapperRef,
    setCoordinatesByTouchEvent,
    onEnter,
    isSharpMode,
    setIsSharpMode,
  };
};

