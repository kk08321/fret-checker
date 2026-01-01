/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

interface FingeringChipProps {
  label: string; // 例: "1弦0F"
  isSelected: boolean;
  isUnplayable?: boolean;
  onClick: () => void;
}

// スタイル定数
const CHIP_PADDING_X = 12;
const CHIP_PADDING_Y = 8;
const CHIP_MIN_HEIGHT = 44; // アクセシビリティのための最小タップ領域
const CHIP_BORDER_RADIUS = 16;
const CHIP_FONT_SIZE = 14;

const chipBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${CHIP_PADDING_Y}px ${CHIP_PADDING_X}px;
  min-height: ${CHIP_MIN_HEIGHT}px;
  border-radius: ${CHIP_BORDER_RADIUS}px;
  font-size: ${CHIP_FONT_SIZE}px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  border: 1.5px solid transparent;
  white-space: nowrap;
`;

const chipNormal = css`
  ${chipBase};
  background-color: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.7);
  border-color: rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.12);
    transform: scale(0.98);
  }
`;

const chipSelected = css`
  ${chipBase};
  background-color: rgba(33, 150, 243, 0.15);
  color: rgb(33, 150, 243);
  border-color: rgb(33, 150, 243);
  font-weight: 600;

  &:hover {
    background-color: rgba(33, 150, 243, 0.2);
    border-color: rgba(33, 150, 243, 0.8);
  }

  &:active {
    background-color: rgba(33, 150, 243, 0.25);
    transform: scale(0.98);
  }
`;

const chipUnplayable = css`
  ${chipBase};
  background-color: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 0, 0, 0.08);
  cursor: not-allowed;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

export const FingeringChip = ({ label, isSelected, isUnplayable = false, onClick }: FingeringChipProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUnplayable) {
      onClick();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUnplayable) {
      onClick();
    }
  };

  const chipStyle = isUnplayable
    ? chipUnplayable
    : isSelected
    ? chipSelected
    : chipNormal;

  return (
    <div
      css={chipStyle}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      role={isUnplayable ? undefined : "button"}
      aria-pressed={isUnplayable ? undefined : isSelected}
      tabIndex={isUnplayable ? -1 : 0}
    >
      {label}
    </div>
  );
};

