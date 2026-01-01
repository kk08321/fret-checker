/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import Bar from "./Bar";
import ControlPanel from "./components/ControlPanel";
import { MeasureBar } from "./components/MeasureBar";
import { useSheetPage } from "./hooks/useSheetPage";
import { useKeySignature } from "./contexts/KeySignatureContext";
import { useAudioSettings } from "./contexts/AudioSettingsContext";
import { KEY_SIGNATURES, getKeySignatureNoteNames, getNoteNameFromNoteNumber } from "./utils/keySignature";
import { calculateNoteOffset } from "./utils/noteUtils";
import { ModeBadge } from "./components/ModeBadge";
import { playChord } from "./utils/audio";
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
    isNaturalMode,
    setIsNaturalMode,
    recordDragStart,
    measures,
    currentMeasureIndex,
    saveCurrentMeasureAndCreateNew,
    deleteCurrentMeasure,
    navigateToMeasure,
  } = useSheetPage();
  
  const { selectedKeySignature } = useKeySignature();
  const { audioPlayback } = useAudioSettings();
  
  const isAudioEnabled = audioPlayback === "enabled";

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
      setIsNaturalMode(false); // ナチュラルモードをリセット
    }
    setIsSharpMode(enabled);
  };

  const handleFlatModeStart = (enabled: boolean) => {
    if (enabled) {
      setIsSharpMode(false); // シャープモードをリセット
      setIsNaturalMode(false); // ナチュラルモードをリセット
    }
    setIsFlatMode(enabled);
  };

  const handleNaturalModeStart = (enabled: boolean) => {
    if (enabled) {
      setIsSharpMode(false); // シャープモードをリセット
      setIsFlatMode(false); // フラットモードをリセット
    }
    setIsNaturalMode(enabled);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputtedNoteNumbers.length > 0) {
      console.log('Playing chord:', inputtedNoteNumbers);
      playChord(inputtedNoteNumbers);
    }
  };

  const handlePlayTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePlayTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputtedNoteNumbers.length > 0) {
      console.log('Playing chord:', inputtedNoteNumbers);
      playChord(inputtedNoteNumbers);
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
        padding-top: 50px;
        box-sizing: border-box;
        position: relative;
      `}
      onTouchStart={setCoordinatesByTouchEvent}
      onTouchMove={setCoordinatesByTouchEvent}
      onTouchEnd={onEnter}
    >
      <MeasureBar
        currentMeasureIndex={currentMeasureIndex}
        totalMeasures={measures.length}
        onAddMeasure={saveCurrentMeasureAndCreateNew}
        onDeleteMeasure={deleteCurrentMeasure}
        onNavigateMeasure={navigateToMeasure}
      />
      {/* 再生ボタン */}
      {isAudioEnabled && (
        <button
          onClick={handlePlay}
          onTouchStart={handlePlayTouchStart}
          onTouchEnd={handlePlayTouchEnd}
          disabled={inputtedNoteNumbers.length === 0}
          css={css`
            position: absolute;
            top: 55px;
            left: 10px;
            z-index: 200;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 1px solid rgba(0, 0, 0, 0.15);
            background: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.6);
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            transition: all 0.2s;
            box-sizing: border-box;
            
            &:hover:not(:disabled) {
              background: rgba(0, 0, 0, 0.08);
              border-color: rgba(0, 0, 0, 0.2);
              color: rgba(0, 0, 0, 0.7);
            }
            
            &:active:not(:disabled) {
              transform: scale(0.95);
              background: rgba(0, 0, 0, 0.1);
            }
            
            &:disabled {
              background: rgba(0, 0, 0, 0.03);
              cursor: not-allowed;
              opacity: 0.4;
            }
          `}
          title="再生"
        >
          ▶
        </button>
      )}
      {isSharpMode && <ModeBadge label="シャープモード" symbol="#" />}
      {isFlatMode && <ModeBadge label="フラットモード" symbol="♭" />}
      {isNaturalMode && <ModeBadge label="ナチュラルモード" symbol="♮" />}
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
          
          // シャープ記号、フラット記号、ナチュラル記号を除去して比較（"0#"と"0b"と"0n"と"0"をマッチさせるため）
          const noteIndex = inputtedNoteNumbers.findIndex(n => n.replace('#', '').replace('b', '').replace('n', '') === note);
          const isInputted = noteIndex !== -1;
          
          // 連続する音符のグループを考慮してオフセットを計算
          const currentNoteNum = 23 - i;
          const horizontalOffset = calculateNoteOffset(currentNoteNum, inputtedNoteNumbers);
          
          // 調号記号の情報を取得
          let showKeySignatureSharp = false;
          let showKeySignatureFlat = false;
          let keySignatureIndex: number | undefined = undefined;
          let isKeySignatureSharp = false;
          let isKeySignatureFlat = false;
          
          if (selectedKeySignature) {
            const keySignature = KEY_SIGNATURES[selectedKeySignature];
            const { sharpNames, flatNames } = getKeySignatureNoteNames(keySignature);
            const currentNoteName = getNoteNameFromNoteNumber(currentNoteNum);
            
            // 調号記号の表示位置は元の設定（特定のnote番号）で判定
            // シャープ記号の位置をチェック
            const sharpIndex = keySignature.sharps.findIndex(noteNum => noteNum === currentNoteNum);
            if (sharpIndex !== -1) {
              showKeySignatureSharp = true;
              keySignatureIndex = sharpIndex;
            }
            
            // フラット記号の位置をチェック
            const flatIndex = keySignature.flats.findIndex(noteNum => noteNum === currentNoteNum);
            if (flatIndex !== -1) {
              showKeySignatureFlat = true;
              keySignatureIndex = flatIndex;
            }
            
            // 臨時記号の表示判定は音名ベース（調号により自動適用された音名かどうか）
            if (sharpNames.has(currentNoteName)) {
              isKeySignatureSharp = true;
            }
            if (flatNames.has(currentNoteName)) {
              isKeySignatureFlat = true;
            }
          }
          
          // ナチュラル付きかどうかを判定
          const isNatural = isInputted && inputtedNoteNumbers[noteIndex].includes('n');
          
          // シャープ付きかどうかを判定（調号により自動適用されたものは除外、ナチュラルが付いている場合は表示しない）
          const isSharp = isInputted && inputtedNoteNumbers[noteIndex].includes('#') && !isKeySignatureSharp && !isNatural;
          // フラット付きかどうかを判定（調号により自動適用されたものは除外、ナチュラルが付いている場合は表示しない）
          const isFlat = isInputted && inputtedNoteNumbers[noteIndex].includes('b') && !isKeySignatureFlat && !isNatural;
          
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
              isNatural={isNatural}
              showKeySignatureSharp={showKeySignatureSharp}
              showKeySignatureFlat={showKeySignatureFlat}
              keySignatureIndex={keySignatureIndex}
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
        onNaturalModeStart={handleNaturalModeStart}
        isNaturalMode={isNaturalMode}
        recordDragStart={recordDragStart}
      />
    </div>
  );
}

export default SheetPage;
