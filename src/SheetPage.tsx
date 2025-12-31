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
    setSelectedNote,
    sheetWrapperHeight,
    notes,
    inputtedNoteNumbers,
    pageWrapperRef,
    controlWrapperRef,
    setCoordinatesByTouchEvent,
    onEnter,
  } = useSheetPage();

  // 連続する音符のグループを検出し、各音符のオフセットを計算
  const calculateOffset = (noteNum: number): number => {
    if (inputtedNoteNumbers.length === 0) return 0;
    
    // 入力された音符を数値に変換してソート
    const inputtedNums = inputtedNoteNumbers
      .map(n => parseInt(n, 10))
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
          
          const noteIndex = inputtedNoteNumbers.indexOf(note);
          const isInputted = noteIndex !== -1;
          
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
            />
          );
        })}
      </div>

      <ControlPanel notes={notes} controlWrapperRef={controlWrapperRef} />
    </div>
  );
}

export default SheetPage;
