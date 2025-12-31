/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Bar from "./Bar";
import ControlPanel from "./components/ControlPanel";
import { useSheetPage } from "./hooks/useSheetPage";
import {
  sheetWrapper,
  whiteBarWrapperCss,
  blackBarWrapperCss,
  whiteBarCss,
  blackLongBarCss,
  blackShortBarCss,
} from "./styles/sheetPageStyles";

function SheetPage() {
  const {
    touchCoordinates,
    setTouchCoordinates,
    setSelectedNote,
    sheetWrapperHeight,
    notes,
    inputtedNoteNumbers,
    setInputtedNoteNumbers,
    pageWrapperRef,
    controlWrapperRef,
    setCoordinatesByTouchEvent,
    onEnter,
    setIsSharpMode,
  } = useSheetPage();

  // 連続する音符のグループを検出し、各音符のオフセットを計算
  const calculateOffset = (noteNum: number): number => {
    if (inputtedNoteNumbers.length === 0) return 0;
    
    // 入力された音符を数値に変換してソート（シャープ記号を除去してからparseInt）
    const inputtedNums = inputtedNoteNumbers
      .map(n => parseInt(n.replace('#', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    // 現在の音符が入力されているかチェック
    if (!inputtedNums.includes(noteNum)) return 0;
    
    // 連続するグループを見つける
    const groups: number[][] = [];
    let currentGroup: number[] = [inputtedNums[0]];
    
    for (let i = 1; i < inputtedNums.length; i++) {
      if (inputtedNums[i] === inputtedNums[i - 1] + 1) {
        // 連続している
        currentGroup.push(inputtedNums[i]);
      } else {
        // 連続が途切れた
        groups.push(currentGroup);
        currentGroup = [inputtedNums[i]];
      }
    }
    groups.push(currentGroup);
    
    // 現在の音符が属するグループを見つける
    const group = groups.find(g => g.includes(noteNum));
    if (!group) return 0;
    
    // グループの長さが1の場合はオフセットなし
    if (group.length === 1) return 0;
    
    // グループ内での位置を取得（0から始まるインデックス）
    const indexInGroup = group.indexOf(noteNum);
    
    // インデックスが奇数の場合（2番目、4番目、6番目...）は左にずらす
    // インデックスが偶数の場合（1番目、3番目、5番目...）は中央
    if (indexInGroup % 2 === 1) {
      return -35;
    } else {
      return 0;
    }
  };

  const handleClearSelection = () => {
    setSelectedNote(null);
    setTouchCoordinates(null);
    // 最後に入力された音符を削除
    if (inputtedNoteNumbers.length > 0) {
      setInputtedNoteNumbers([]);
    }
  };

  const handleUndo = () => {
    setSelectedNote(null);
    setTouchCoordinates(null);
    // 最後に入力された音符を1つ削除
    if (inputtedNoteNumbers.length > 0) {
      setInputtedNoteNumbers(inputtedNoteNumbers.slice(0, -1));
    }
  };

  return (
    <div
      ref={pageWrapperRef}
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding-bottom: 60px;
        box-sizing: border-box;
      `}
      onTouchStart={setCoordinatesByTouchEvent}
      onTouchMove={setCoordinatesByTouchEvent}
      onTouchEnd={onEnter}
    >
      <div
        css={[
          sheetWrapper,
          css`
            height: ${sheetWrapperHeight}px;
          `,
        ]}
      >
        {Array.from({ length: 24 }, (_, i) => {
          const note = String(23 - i);
          const isEven = (23 - i) % 2 === 0;
          
          // 黒バーのスタイルを決定（15-7は長い、それ以外は短い）
          const isBlackLong = (23 - i) >= 7 && (23 - i) <= 15 && (23 - i) % 2 === 1;
          
          const wrapperCss = isEven ? whiteBarWrapperCss : blackBarWrapperCss;
          const barCss = isEven 
            ? whiteBarCss 
            : (isBlackLong ? blackLongBarCss : blackShortBarCss);
          
          // シャープ記号を除去して比較（"0#"と"0"をマッチさせるため）
          const noteIndex = inputtedNoteNumbers.findIndex(n => n.replace('#', '') === note);
          const isInputted = noteIndex !== -1;
          
          // シャープ付きかどうかを判定
          const isSharp = isInputted && inputtedNoteNumbers[noteIndex].includes('#');
          
          // 連続する音符のグループを考慮してオフセットを計算
          const currentNoteNum = 23 - i;
          const horizontalOffset = calculateOffset(currentNoteNum);
          
          return (
            <Bar
              key={note}
              note={note}
              onSelected={setSelectedNote}
              coordinates={touchCoordinates}
              wrapperCss={wrapperCss}
              barCss={barCss}
              isInputted={isInputted}
              noteNumber={isInputted ? noteIndex + 1 : null}
              horizontalOffset={horizontalOffset}
              isSharp={isSharp}
            />
          );
        })}
      </div>

      <ControlPanel 
        notes={notes} 
        controlWrapperRef={controlWrapperRef} 
        onClearSelection={handleClearSelection} 
        onUndo={handleUndo}
        onSharpModeStart={setIsSharpMode}
      />
    </div>
  );
}

export default SheetPage;
