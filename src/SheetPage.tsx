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
    isSharpMode,
    setIsSharpMode,
    isFlatMode,
    setIsFlatMode,
  } = useSheetPage();

  // 連続する音符のグループを検出し、各音符のオフセットを計算
  const calculateOffset = (noteNum: number): number => {
    if (inputtedNoteNumbers.length === 0) return 0;
    
    // 入力された音符を数値に変換してソート（シャープ記号とフラット記号を除去してからparseInt）
    const inputtedNums = inputtedNoteNumbers
      .map(n => parseInt(n.replace('#', '').replace('b', ''), 10))
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

  const handleSharpModeStart = (enabled: boolean) => {
    if (enabled) {
      setIsFlatMode(false); // フラットモードをリセット
    }
    setIsSharpMode(enabled);
  };

  const handleFlatModeStart = (enabled: boolean) => {
    if (enabled) {
      setIsSharpMode(false); // シャープモードをリセット
    }
    setIsFlatMode(enabled);
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
        position: relative;
      `}
      onTouchStart={setCoordinatesByTouchEvent}
      onTouchMove={setCoordinatesByTouchEvent}
      onTouchEnd={onEnter}
    >
      {isSharpMode && (
        <div
          css={css`
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            -webkit-transform: translateX(-50%);
            background-color: rgba(74, 144, 226, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 200;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 6px;
            pointer-events: none;
            animation: fadeIn 0.2s ease;
            
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-10px);
                -webkit-transform: translateX(-50%) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
                -webkit-transform: translateX(-50%) translateY(0);
              }
            }
          `}
        >
          <span>#</span>
          <span>シャープモード</span>
        </div>
      )}
      {isFlatMode && (
        <div
          css={css`
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(74, 144, 226, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 200;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 6px;
            pointer-events: none;
            animation: fadeIn 0.2s ease;
            
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `}
        >
          <span>♭</span>
          <span>フラットモード</span>
        </div>
      )}
      <div
        css={[
          sheetWrapper,
          css`
            height: ${sheetWrapperHeight}px;
            position: relative;
          `,
        ]}
      >
        {/* ト音記号 */}
        {(() => {
          return (
            <>
              <div
                css={css`
                  position: absolute;
                  left: 20px;
                  top: 54%;
                  transform: translateY(-50%);
                  -webkit-transform: translateY(-50%);
                  height: 48%;
                  max-height: 48%;
                  z-index: 50;
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  box-sizing: border-box;
                `}
              >
                <img
                  src="/images/gcref.png"
                  alt="ト音記号"
                  css={css`
                    width: auto;
                    height: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    display: block;
                    box-sizing: border-box;
                  `}
                />
              </div>
            </>
          );
        })()}
        {Array.from({ length: 24 }, (_, i) => {
          const note = String(23 - i);
          const isEven = (23 - i) % 2 === 0;
          
          // 黒バーのスタイルを決定（15-7は長い、それ以外は短い）
          const isBlackLong = (23 - i) >= 7 && (23 - i) <= 15 && (23 - i) % 2 === 1;
          
          const wrapperCss = isEven ? whiteBarWrapperCss : blackBarWrapperCss;
          const barCss = isEven 
            ? whiteBarCss 
            : (isBlackLong ? blackLongBarCss : blackShortBarCss);
          
          // シャープ記号とフラット記号を除去して比較（"0#"と"0b"と"0"をマッチさせるため）
          const noteIndex = inputtedNoteNumbers.findIndex(n => n.replace('#', '').replace('b', '') === note);
          const isInputted = noteIndex !== -1;
          
          // シャープ付きかどうかを判定
          const isSharp = isInputted && inputtedNoteNumbers[noteIndex].includes('#');
          // フラット付きかどうかを判定
          const isFlat = isInputted && inputtedNoteNumbers[noteIndex].includes('b');
          
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
              isFlat={isFlat}
            />
          );
        })}
      </div>

      <ControlPanel 
        notes={notes} 
        controlWrapperRef={controlWrapperRef} 
        onClearSelection={handleClearSelection} 
        onUndo={handleUndo}
        onSharpModeStart={handleSharpModeStart}
        isSharpMode={isSharpMode}
        onFlatModeStart={handleFlatModeStart}
        isFlatMode={isFlatMode}
      />
    </div>
  );
}

export default SheetPage;
