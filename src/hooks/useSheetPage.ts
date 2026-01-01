import { useEffect, useRef, useState } from "react";
import { convertNoteToGuitarPositions } from "../utils/midi";
import { useGuitarNotes } from "../contexts/GuitarNotesContext";
import { useKeySignature } from "../contexts/KeySignatureContext";
import { useTuning } from "../contexts/TuningContext";
import { useAudioSettings } from "../contexts/AudioSettingsContext";
import { KEY_SIGNATURES, getKeySignatureNoteNames, getNoteNameFromNoteNumber } from "../utils/keySignature";
import { playChord } from "../utils/audio";

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
  const { audioPlayback } = useAudioSettings();
  
  // 小節管理の状態
  const [measures, setMeasures] = useState<string[][]>([[]]); // 小節の配列（各小節は音符の配列）
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0); // 現在の小節インデックス
  const isLoadingMeasureRef = useRef(false); // 小節読み込み中フラグ（無限ループを防ぐ）
  const currentMeasureIndexRef = useRef(0); // currentMeasureIndexの最新値を保持
  
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
    // タッチ位置がMeasureBarの範囲内（画面上部50px）かチェック
    if (touchCoordinates) {
      const measureBarTop = 0;
      const measureBarBottom = 50;
      
      if (
        touchCoordinates.y >= measureBarTop &&
        touchCoordinates.y <= measureBarBottom
      ) {
        // MeasureBarの範囲内の場合はnote入力をスキップ
        setIsSharpMode(false);
        setIsFlatMode(false);
        setIsNaturalMode(false);
        setTouchCoordinates({ x: 0, y: -100 });
        return;
      }
    }

    // タッチ位置が再生ボタン周辺（左上70px x 70pxの範囲）かチェック
    if (pageWrapperRef.current && touchCoordinates) {
      const pageRect = pageWrapperRef.current.getBoundingClientRect();
      // 再生ボタンはpageWrapper内でtop: 60px, left: 10pxにあり、サイズは50px x 50px
      // pageWrapperにはpadding-top: 50pxがあるので、pageRect.topは既に50px下にずれている
      // マージンを考慮して70px x 70pxの範囲を無視
      const buttonAreaLeft = pageRect.left;
      const buttonAreaTop = pageRect.top + 60 - 10; // ボタン位置(60px) - マージン(10px) = 50px
      const buttonAreaRight = pageRect.left + 70;
      const buttonAreaBottom = pageRect.top + 60 + 60; // ボタン位置(60px) + ボタン高さ(50px) + マージン(10px) = 120px
      
      if (
        touchCoordinates.x >= buttonAreaLeft &&
        touchCoordinates.x <= buttonAreaRight &&
        touchCoordinates.y >= buttonAreaTop &&
        touchCoordinates.y <= buttonAreaBottom
      ) {
        // 再生ボタン周辺の場合は処理をスキップ
        setTouchCoordinates({ x: 0, y: -100 });
        return;
      }
    }
    
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
    
    // 更新されたすべての音符を同時に再生（和音として）- 設定で有効な場合のみ
    if (audioPlayback === "enabled" && noteNumbersCopy.length > 0) {
      playChord(noteNumbersCopy);
    }
    
    setTouchCoordinates({ x: 0, y: -100 });
  };

  // currentMeasureIndexの変更をrefに反映
  useEffect(() => {
    currentMeasureIndexRef.current = currentMeasureIndex;
  }, [currentMeasureIndex]);

  // inputtedNoteNumbersが変更されたときに、現在の小節に保存する
  useEffect(() => {
    if (!isLoadingMeasureRef.current) {
      setMeasures(prevMeasures => {
        const newMeasures = [...prevMeasures];
        const currentIndex = currentMeasureIndexRef.current;
        if (newMeasures[currentIndex] !== undefined) {
          newMeasures[currentIndex] = [...inputtedNoteNumbers];
        }
        return newMeasures;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputtedNoteNumbers]);

  // 小節を保存して新規小節を作成
  const saveCurrentMeasureAndCreateNew = () => {
    const currentNotes = [...inputtedNoteNumbers];
    const newMeasures = [...measures];
    newMeasures[currentMeasureIndex] = currentNotes; // 現在の小節を保存
    newMeasures.push([]); // 新規小節を追加
    setMeasures(newMeasures);
    isLoadingMeasureRef.current = true;
    setCurrentMeasureIndex(newMeasures.length - 1);
    setInputtedNoteNumbers([]); // 新規小節なので空にする
    isLoadingMeasureRef.current = false;
  };

  // 現在の小節を削除
  const deleteCurrentMeasure = () => {
    // 小節が1つだけの場合は削除しない（空の小節を1つ残す）
    if (measures.length <= 1) {
      return;
    }

    isLoadingMeasureRef.current = true;
    const newMeasures = [...measures];
    newMeasures.splice(currentMeasureIndex, 1); // 現在の小節を削除
    
    // 削除後のインデックスを決定
    let newIndex: number;
    if (currentMeasureIndex === measures.length - 1) {
      // 最後の小節を削除した場合は、新しい最後の小節に移動
      newIndex = newMeasures.length - 1;
    } else {
      // それ以外の場合は、前の小節に移動（インデックスを1つ減らす）
      newIndex = currentMeasureIndex - 1;
      if (newIndex < 0) {
        newIndex = 0;
      }
    }
    
    setMeasures(newMeasures);
    setCurrentMeasureIndex(newIndex);
    setInputtedNoteNumbers([...newMeasures[newIndex]]);
    isLoadingMeasureRef.current = false;
  };

  // 小節間を移動
  const navigateToMeasure = (direction: 'prev' | 'next') => {
    const currentNotes = [...inputtedNoteNumbers];
    const newMeasures = [...measures];
    newMeasures[currentMeasureIndex] = currentNotes; // 現在の入力を保存
    
    if (direction === 'prev' && currentMeasureIndex > 0) {
      setMeasures(newMeasures);
      isLoadingMeasureRef.current = true;
      const targetIndex = currentMeasureIndex - 1;
      setCurrentMeasureIndex(targetIndex);
      setInputtedNoteNumbers([...newMeasures[targetIndex]]);
      isLoadingMeasureRef.current = false;
    } else if (direction === 'next' && currentMeasureIndex < measures.length - 1) {
      setMeasures(newMeasures);
      isLoadingMeasureRef.current = true;
      const targetIndex = currentMeasureIndex + 1;
      setCurrentMeasureIndex(targetIndex);
      setInputtedNoteNumbers([...newMeasures[targetIndex]]);
      isLoadingMeasureRef.current = false;
    } else {
      setMeasures(newMeasures);
    }
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
    // 小節管理関連
    measures,
    currentMeasureIndex,
    saveCurrentMeasureAndCreateNew,
    deleteCurrentMeasure,
    navigateToMeasure,
  };
};

