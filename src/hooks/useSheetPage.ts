import { useEffect, useRef, useState } from "react";
import { convertNoteToGuitarPositions } from "../utils/midi";
import { useGuitarNotes } from "../contexts/GuitarNotesContext";
import { useKeySignature } from "../contexts/KeySignatureContext";
import { useTuning } from "../contexts/TuningContext";
import { useAudioSettings } from "../contexts/AudioSettingsContext";
import { useMeasure } from "../contexts/MeasureContext";
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
  const {
    measures,
    currentMeasureIndex,
    saveCurrentMeasureAndCreateNew,
    deleteCurrentMeasure,
    navigateToMeasure,
    updateCurrentMeasure,
  } = useMeasure();
  
  // inputtedNoteNumbersから動的にnotesを計算
  const notes = inputtedNoteNumbers.map(noteNumStr => convertNoteToGuitarPositions(noteNumStr, tuning));
  
  const pageWrapperRef = useRef<HTMLDivElement>(null);
  const controlWrapperRef = useRef<HTMLDivElement>(null);
  // D&D操作の開始位置を追跡（ControlPanelから始まった操作かどうかを判定するため）
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

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
      // D&D操作の場合のみモードをリセット（トグルモードの場合は維持）
      // ControlPanelから始まった操作（D&D操作）の場合のみリセット
      if (dragStartPosRef.current && controlWrapperRef.current) {
        const controlRect = controlWrapperRef.current.getBoundingClientRect();
        const startX = dragStartPosRef.current.x;
        const startY = dragStartPosRef.current.y;
        // 開始位置がControlPanelの範囲内かチェック
        if (
          startX >= controlRect.left &&
          startX <= controlRect.right &&
          startY >= controlRect.top &&
          startY <= controlRect.bottom
        ) {
          // D&D操作の場合のみモードをリセット
          setIsSharpMode(false);
          setIsFlatMode(false);
          setIsNaturalMode(false);
        }
      }
      // D&D操作の開始位置をクリア
      dragStartPosRef.current = null;
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

  // inputtedNoteNumbersをページから読み込んでいる最中かどうかを示すフラグ
  // このフラグにより、ページ読み込み時にupdateCurrentMeasureが呼ばれるのを防ぐ（無限ループ防止）
  const isUpdatingFromMeasureRef = useRef(false);

  /**
   * inputtedNoteNumbersが変更されたときに、現在のページに保存する
   * ユーザーが音符を入力した際に、その内容を現在のページに反映する
   */
  useEffect(() => {
    // ページから読み込んでいる最中でない場合のみ更新
    if (!isUpdatingFromMeasureRef.current) {
      updateCurrentMeasure(inputtedNoteNumbers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputtedNoteNumbers]);

  /**
   * currentMeasureIndexまたはmeasures.lengthが変更されたときに、対応するページの内容をinputtedNoteNumbersに設定
   * ページを切り替えた際に、そのページの音符を表示するために呼ばれる
   * measures.lengthを依存配列に含めることで、削除時にcurrentMeasureIndexが変更されない場合でも検知できる
   */
  useEffect(() => {
    if (measures[currentMeasureIndex] !== undefined) {
      isUpdatingFromMeasureRef.current = true;
      setInputtedNoteNumbers([...measures[currentMeasureIndex].notes]);
      isUpdatingFromMeasureRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMeasureIndex, measures.length]);

  /**
   * 現在のページを保存して新規ページを作成
   * 現在の入力内容を保存してから、新しい空のページを作成する
   */
  const handleSaveCurrentMeasureAndCreateNew = () => {
    updateCurrentMeasure(inputtedNoteNumbers); // 現在の入力をページに保存
    saveCurrentMeasureAndCreateNew(); // 新規ページを作成して移動
    // currentMeasureIndexが変更されるので、上記のuseEffectが実行される
    // 新規ページは空なので、useEffectで空の配列がinputtedNoteNumbersに設定される
  };

  /**
   * 現在のページを削除
   * 現在の入力内容を保存してから、ページを削除する
   */
  const handleDeleteCurrentMeasure = () => {
    updateCurrentMeasure(inputtedNoteNumbers); // 現在の入力をページに保存
    deleteCurrentMeasure(); // ページを削除
    // currentMeasureIndexが変更されるので、上記のuseEffectが実行される
    // 削除後のページの内容がinputtedNoteNumbersに設定される
  };

  /**
   * 前後のページに移動
   * 現在の入力内容を保存してから、指定方向のページに移動する
   * @param direction 移動方向（'prev' または 'next'）
   */
  const handleNavigateToMeasure = (direction: 'prev' | 'next') => {
    updateCurrentMeasure(inputtedNoteNumbers); // 現在の入力をページに保存
    navigateToMeasure(direction); // ページを移動
    // currentMeasureIndexが変更されるので、上記のuseEffectが実行される
    // 移動先のページの内容がinputtedNoteNumbersに設定される
  };

  // D&D操作の開始位置を記録するコールバック
  const recordDragStart = (x: number, y: number) => {
    dragStartPosRef.current = { x, y };
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
    recordDragStart,
    // ページ管理関連
    measures,
    currentMeasureIndex,
    saveCurrentMeasureAndCreateNew: handleSaveCurrentMeasureAndCreateNew,
    deleteCurrentMeasure: handleDeleteCurrentMeasure,
    navigateToMeasure: handleNavigateToMeasure,
  };
};

