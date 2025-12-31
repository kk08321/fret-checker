import { useEffect, useRef, useState } from "react";
import { convertNoteToGuitarPositions } from "../utils/midi";
import { useGuitarNotes } from "../contexts/GuitarNotesContext";
import { useKeySignature } from "../contexts/KeySignatureContext";
import { useTuning } from "../contexts/TuningContext";
import { KEY_SIGNATURES, getKeySignatureNoteNames, getNoteNameFromNoteNumber } from "../utils/keySignature";

interface Coordinates {
  x: number;
  y: number;
}

export const useSheetPage = () => {
  const [touchCoordinates, setTouchCoordinates] = useState<Coordinates | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [sheetWrapperHeight, setSheetWrapperHeight] = useState(0);
  const [isSharpMode, setIsSharpMode] = useState(false);
  const [isFlatMode, setIsFlatMode] = useState(false);
  const [isNaturalMode, setIsNaturalMode] = useState(false);
  const { inputtedNoteNumbers, setInputtedNoteNumbers } = useGuitarNotes();
  const { selectedKeySignature } = useKeySignature();
  const { tuning } = useTuning();
  
  // inputtedNoteNumbersから動的にnotesを計算
  const notes = inputtedNoteNumbers.map(noteNumStr => convertNoteToGuitarPositions(noteNumStr, tuning));
  
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
        // ControlPanelの範囲内の場合はnote入力をスキップし、シャープモードとフラットモード、ナチュラルモードをリセット
        setIsSharpMode(false);
        setIsFlatMode(false);
        setIsNaturalMode(false);
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
        // Barの範囲外の場合はnote入力をスキップし、シャープモードとフラットモード、ナチュラルモードをリセット
        setIsSharpMode(false);
        setIsFlatMode(false);
        setIsNaturalMode(false);
        setTouchCoordinates({ x: 0, y: -100 });
        return;
      }
    }

    let noteNumbersCopy: string[] = [];
    if (inputtedNoteNumbers.length < 6) {
      noteNumbersCopy = [...inputtedNoteNumbers];
    }
    if (selectedNote !== null) {
      let noteToAdd = selectedNote;
      const noteNum = parseInt(selectedNote, 10);
      
      // 手動モードが有効な場合はそれを優先
      if (isNaturalMode) {
        // ナチュラルモード: 調号のシャープ/フラットを無効化
        noteToAdd = `${selectedNote}n`;
      } else if (isSharpMode) {
        noteToAdd = `${selectedNote}#`;
      } else if (isFlatMode) {
        noteToAdd = `${selectedNote}b`;
      } else if (selectedKeySignature && !isNaN(noteNum)) {
        // 調号設定に基づいて自動的にシャープ/フラットを適用
        const keySignature = KEY_SIGNATURES[selectedKeySignature];
        const { sharpNames, flatNames } = getKeySignatureNoteNames(keySignature);
        
        // note番号から音名を取得
        const noteName = getNoteNameFromNoteNumber(noteNum);
        
        // 調号のシャープに含まれている音名かチェック
        if (sharpNames.has(noteName)) {
          noteToAdd = `${selectedNote}#`;
        }
        // 調号のフラットに含まれている音名かチェック
        else if (flatNames.has(noteName)) {
          noteToAdd = `${selectedNote}b`;
        }
      }
      
      noteNumbersCopy.push(noteToAdd);
      // シャープモードとフラットモード、ナチュラルモードをリセット
      setIsSharpMode(false);
      setIsFlatMode(false);
      setIsNaturalMode(false);
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
    isFlatMode,
    setIsFlatMode,
    isNaturalMode,
    setIsNaturalMode,
  };
};

