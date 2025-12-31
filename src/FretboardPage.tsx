/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useGuitarNotes } from "./contexts/GuitarNotesContext";
import { noteNumberToMidi, getGuitarPositions } from "./utils/midi";

function FretboardPage() {
  const { inputtedNoteNumbers } = useGuitarNotes();

  // デバッグ用：inputtedNoteNumbersを確認
  console.log("FretboardPage - inputtedNoteNumbers:", inputtedNoteNumbers);
  console.log("FretboardPage - inputtedNoteNumbers.length:", inputtedNoteNumbers.length);

  // 各音符から押弦箇所を計算
  const getFretPositions = () => {
    const positions: Array<{ string: number; fret: number; noteIndex: number }> = [];
    
    inputtedNoteNumbers.forEach((noteNumStr, index) => {
      const noteNum = parseInt(noteNumStr, 10);
      if (isNaN(noteNum)) return;
      
      const midi = noteNumberToMidi(noteNum);
      const guitarPositions = getGuitarPositions(midi);
      
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

  // 12平均律に基づくフレット間隔の計算
  // フレットnからn+1までの距離は 2^(-n/12) - 2^(-(n+1)/12) に比例
  const getFretHeight = (fret: number, baseHeight: number = 90): number => {
    if (fret === 0) {
      // 開放フレット（0フレット）の高さは基準の半分
      return baseHeight / 2;
    }
    
    // フレットn-1からnまでの距離を計算
    // 2^(-(n-1)/12) - 2^(-n/12)
    const ratio = Math.pow(2, -(fret - 1) / 12) - Math.pow(2, -fret / 12);
    
    // 1フレット目の比率（開放から1フレットまで）
    const firstFretRatio = 1 - Math.pow(2, -1 / 12);
    
    // 1フレット目を基準に正規化
    return baseHeight * (ratio / firstFretRatio);
  };

  // 各フレットの高さを事前計算
  const frets = Array.from({ length: 20 }, (_, i) => i); // 0フレット（開放）から19フレット
  const fretHeights = frets.map(fret => getFretHeight(fret));

  const fretPositions = getFretPositions();
  const strings = [6, 5, 4, 3, 2, 1]; // 6弦から1弦（ギターの標準的な表示順）

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
        padding-bottom: 70px;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
      `}
    >
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
