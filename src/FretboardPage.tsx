/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useEffect } from "react";
import { useGuitarNotes } from "./contexts/GuitarNotesContext";
import { useTuning } from "./contexts/TuningContext";
import { useMeasure } from "./contexts/MeasureContext";
import { MeasureBar } from "./components/MeasureBar";
import { noteNumberToMidi, getGuitarPositions, getGuitarOpenStrings, midiToNoteName } from "./utils/midi";
import { parseNoteNumber } from "./utils/noteUtils";
import { calculateFretHeights } from "./utils/fretboard";

const NUM_FRETS = 20;

function FretboardPage() {
  const { inputtedNoteNumbers, setInputtedNoteNumbers } = useGuitarNotes();
  const { tuning } = useTuning();
  // MeasureContextから小節情報を取得（SheetPageと共有）
  const {
    measures,
    currentMeasureIndex,
    saveCurrentMeasureAndCreateNew,
    deleteCurrentMeasure,
    navigateToMeasure,
  } = useMeasure();

  /**
   * currentMeasureIndexまたはmeasures.lengthが変更されたときに、対応する小節の内容をinputtedNoteNumbersに設定
   * FretboardPageで小節を切り替えた際に、その小節の音符を表示するために呼ばれる
   * SheetPageとFretboardPageで同じ小節情報を共有するため、どちらのページで小節を切り替えても
   * もう一方のページでも反映される
   * measures.lengthを依存配列に含めることで、削除時にcurrentMeasureIndexが変更されない場合でも検知できる
   */
  useEffect(() => {
    if (measures[currentMeasureIndex] !== undefined) {
      setInputtedNoteNumbers([...measures[currentMeasureIndex]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMeasureIndex, measures.length]);

  // 各音符から押弦箇所を計算
  const getFretPositions = () => {
    const positions: Array<{ string: number; fret: number; noteIndex: number }> = [];
    
    inputtedNoteNumbers.forEach((noteNumStr, index) => {
      const noteNum = parseNoteNumber(noteNumStr);
      if (noteNum === null) return;
      
      const midi = noteNumberToMidi(noteNum);
      const guitarPositions = getGuitarPositions(midi, tuning);
      
      // すべての押弦箇所を追加
      guitarPositions.forEach((position) => {
        positions.push({
          ...position,
          noteIndex: index + 1,
        });
      });
    });
    
    return positions;
  };

  // 各フレットの高さを事前計算
  const frets = Array.from({ length: NUM_FRETS }, (_, i) => i);
  const fretHeights = calculateFretHeights(NUM_FRETS);

  const fretPositions = getFretPositions();
  const strings = [6, 5, 4, 3, 2, 1]; // 6弦から1弦（ギターの標準的な表示順）
  
  // 各弦の開放弦の音名を取得
  const openStrings = getGuitarOpenStrings(tuning);
  const stringTunings = openStrings.map(midi => {
    const { noteName } = midiToNoteName(midi);
    return noteName;
  });

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 10px;
        padding-top: 60px;
        padding-bottom: 70px;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
      `}
    >
      <MeasureBar
        currentMeasureIndex={currentMeasureIndex}
        totalMeasures={measures.length}
        onAddMeasure={saveCurrentMeasureAndCreateNew}
        onDeleteMeasure={deleteCurrentMeasure}
        onNavigateMeasure={navigateToMeasure}
      />
      <div
        css={css`
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 100%;
        `}
      >
        {/* チューニング表示（フレットボードの上、枠外） */}
        <div
          css={css`
            display: flex;
            flex-direction: row;
            margin-bottom: 15px;
            position: relative;
          `}
        >
          {strings.map((stringNum, index) => {
            // フレット番号ヘッダーの左端から最初の弦の中心までの距離を計算
            // ヘッダー幅(30px) + マージン(5px) + フレットボードのボーダー(3px) + 弦の中心位置(14px) = 52px
            // 各弦は28px間隔で並んでいるので、index * 28pxを追加
            const baseOffset = 30 + 5 + 3 + 14; // 52px
            const stringOffset = 28 * index;
            const leftOffset = baseOffset + stringOffset;
            return (
              <div
                key={stringNum}
                css={css`
                  position: absolute;
                  left: ${leftOffset}px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  color: #333;
                  transform: translateX(-50%);
                `}
              >
                {stringTunings[strings.length - 1 - index]}
              </div>
            );
          })}
        </div>

        <div
          css={css`
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            width: 100%;
            max-width: 100%;
          `}
        >
          {/* フレット番号のヘッダー（左側、縦方向、茶色背景の外側） */}
          <div
            css={css`
              display: flex;
              flex-direction: column;
              margin-right: 5px;
            `}
          >
            {frets.map((fret) => (
              <div
                key={fret}
                css={css`
                  min-height: ${fretHeights[fret]}px;
                  height: ${fretHeights[fret]}px;
                  min-width: 30px;
                  width: 30px;
                  text-align: center;
                  font-size: 11px;
                  font-weight: bold;
                  color: #333;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                `}
              >
                {fret === 0 ? "開放" : fret}
              </div>
            ))}
          </div>

          {/* 黒檀のフレットボード（ネック部分） */}
          <div
            css={css`
              display: flex;
              flex-direction: row;
              background-color: #1a1a1a;
              border: 3px solid #0d0d0d;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
              flex-shrink: 0;
              position: relative;
            `}
          >
          {/* 各弦（横方向に並ぶ） */}
          <div
            css={css`
              display: flex;
              flex-direction: row;
            `}
          >
          {strings.map((stringNum) => (
            <div
              key={stringNum}
              css={css`
                display: flex;
                flex-direction: column;
                position: relative;
                min-width: 28px;
                width: 28px;
              `}
            >
              {/* 弦の縦線（クラシックギターのナイロン弦をイメージ） */}
              <div
                css={css`
                  position: absolute;
                  left: 50%;
                  top: 0;
                  bottom: 0;
                  width: 3px;
                  background: linear-gradient(
                    to right,
                    rgba(255, 255, 255, 0.3) 0%,
                    rgba(255, 255, 240, 0.8) 50%,
                    rgba(255, 255, 255, 0.3) 100%
                  );
                  box-shadow: 
                    0 0 2px rgba(255, 255, 255, 0.5),
                    inset 0 0 1px rgba(255, 255, 255, 0.8);
                  transform: translateX(-50%);
                  z-index: 1;
                `}
              />

              {/* フレット（縦方向に並ぶ） */}
              {frets.map((fret) => {
                const position = fretPositions.find(
                  (pos) => pos.string === stringNum && pos.fret === fret
                );

                return (
                  <div
                    key={fret}
                    css={css`
                      min-width: 28px;
                      width: 28px;
                      min-height: ${fretHeights[fret]}px;
                      height: ${fretHeights[fret]}px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      position: relative;
                      background-color: ${fret === 0 ? "#6B2C1A" : "transparent"};
                      flex-shrink: 0;
                      &::after {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: ${fret === 0 ? "4px" : "2px"};
                        background: linear-gradient(
                          to right,
                          ${fret === 0 ? "#a0a0a0" : "#888888"} 0%,
                          ${fret === 0 ? "#e8e8e8" : "#d0d0d0"} 50%,
                          ${fret === 0 ? "#a0a0a0" : "#888888"} 100%
                        );
                        box-shadow: 
                          ${fret === 0 
                            ? "0 2px 4px rgba(192, 192, 192, 0.6), inset 0 -1px 2px rgba(255, 255, 255, 0.4)" 
                            : "0 1px 2px rgba(160, 160, 160, 0.5), inset 0 -1px 1px rgba(255, 255, 255, 0.3)"};
                      }
                    `}
                  >
                    {position && (
                      <div
                        css={css`
                          width: 24px;
                          height: 24px;
                          border-radius: 50%;
                          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          font-size: 11px;
                          font-weight: bold;
                          box-shadow: 
                            0 2px 4px rgba(0, 0, 0, 0.4),
                            inset 0 1px 2px rgba(255, 255, 255, 0.3),
                            inset 0 -1px 2px rgba(0, 0, 0, 0.2);
                          z-index: 10;
                        `}
                      >
                        {position.noteIndex}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          </div>
          
          {/* パールインレイ（指板全体の中央に配置） */}
          {(() => {
            // 各フレットまでの累積高さを計算
            const getFretTopPosition = (fret: number): number => {
              let position = 0;
              for (let i = 0; i < fret; i++) {
                position += fretHeights[i];
              }
              return position;
            };
            
            // フレットボードの幅（6弦 × 28px）
            const fretboardWidth = strings.length * 28;
            const centerX = fretboardWidth / 2;
            
            // パールインレイのスタイル
            const pearlInlayStyle = css`
              position: absolute;
              width: 9px;
              height: 9px;
              border-radius: 50%;
              background: radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.9) 0%,
                rgba(255, 255, 255, 0.7) 30%,
                rgba(240, 240, 240, 0.5) 60%,
                rgba(200, 200, 200, 0.3) 100%
              );
              box-shadow: 
                0 1px 2px rgba(0, 0, 0, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.8),
                inset -1px -1px 2px rgba(0, 0, 0, 0.2);
              z-index: 2;
            `;
            
            return (
              <>
                {/* 5フレット：中央に1つ */}
                <div
                  css={[
                    pearlInlayStyle,
                    css`
                      left: ${centerX}px;
                      top: ${getFretTopPosition(5) + fretHeights[5] / 2}px;
                      transform: translate(-50%, -50%);
                    `,
                  ]}
                />
                
                {/* 7フレット：中央に1つ */}
                <div
                  css={[
                    pearlInlayStyle,
                    css`
                      left: ${centerX}px;
                      top: ${getFretTopPosition(7) + fretHeights[7] / 2}px;
                      transform: translate(-50%, -50%);
                    `,
                  ]}
                />
                
                {/* 12フレット：左右に2つ */}
                <div
                  css={[
                    pearlInlayStyle,
                    css`
                      left: ${centerX - 30}px;
                      top: ${getFretTopPosition(12) + fretHeights[12] / 2}px;
                      transform: translate(-50%, -50%);
                    `,
                  ]}
                />
                <div
                  css={[
                    pearlInlayStyle,
                    css`
                      left: ${centerX + 30}px;
                      top: ${getFretTopPosition(12) + fretHeights[12] / 2}px;
                      transform: translate(-50%, -50%);
                    `,
                  ]}
                />
              </>
            );
          })()}
        </div>
        </div>
      </div>

      {/* 入力された音符がない場合のメッセージ */}
      {inputtedNoteNumbers.length === 0 && (
        <div
          css={css`
            margin-top: 30px;
            font-size: 18px;
            color: #666;
            text-align: center;
          `}
        >
          五線譜ページで音符を入力すると、ここに押弦箇所が表示されます
        </div>
      )}
    </div>
  );
}

export default FretboardPage;
