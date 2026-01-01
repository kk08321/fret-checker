/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { FingeringChip } from "./FingeringChip";
import { ParsedNote } from "../utils/noteParser";

interface NoteCardProps {
  index: number; // 1-based index (1, 2, 3, ...)
  note: ParsedNote;
  selectedFingeringIndex: number | null; // 選択されているチップのインデックス（nullの場合は選択なし）
  onFingeringSelect: (fingeringIndex: number) => void;
}

// スタイル定数
const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 12;
const CARD_SHADOW = "0 2px 8px rgba(0, 0, 0, 0.08)";
const CARD_MARGIN_BOTTOM = 12;
const BADGE_SIZE = 24;
const BADGE_FONT_SIZE = 12;
const NOTE_NAME_FONT_SIZE = 18;
const CHIPS_GAP = 8;

const card = css`
  background-color: #ffffff;
  border-radius: ${CARD_BORDER_RADIUS}px;
  padding: ${CARD_PADDING}px;
  margin-bottom: ${CARD_MARGIN_BOTTOM}px;
  box-shadow: ${CARD_SHADOW};
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const cardHeader = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const badge = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${BADGE_SIZE}px;
  height: ${BADGE_SIZE}px;
  border-radius: ${BADGE_SIZE / 2}px;
  background-color: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.6);
  font-size: ${BADGE_FONT_SIZE}px;
  font-weight: 600;
  flex-shrink: 0;
`;

const noteName = css`
  font-size: ${NOTE_NAME_FONT_SIZE}px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  flex: 1;
`;

const actionArea = css`
  width: 48px; /* 将来のアクションボタン用のスペース */
  flex-shrink: 0;
`;

const chipsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${CHIPS_GAP}px;
  align-items: flex-start;
`;

const unplayableMessage = css`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  font-style: italic;
  padding: 8px 0;
`;

export const NoteCard = ({
  index,
  note,
  selectedFingeringIndex,
  onFingeringSelect,
}: NoteCardProps) => {
  return (
    <div css={card}>
      <div css={cardHeader}>
        <div css={badge}>{index}</div>
        <div css={noteName}>{note.noteName}</div>
        <div css={actionArea}></div>
      </div>
      {note.isUnplayable ? (
        <div css={unplayableMessage}>(押弦不可)</div>
      ) : (
        <div css={chipsContainer}>
          {note.fingerings.map((fingering, fingeringIndex) => (
            <FingeringChip
              key={fingeringIndex}
              label={fingering}
              isSelected={selectedFingeringIndex === fingeringIndex}
              onClick={() => onFingeringSelect(fingeringIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

