/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

interface MeasureBarProps {
  currentMeasureIndex: number;
  totalMeasures: number;
  onAddMeasure: () => void;
  onDeleteMeasure: () => void;
  onNavigateMeasure: (direction: 'prev' | 'next') => void;
}

export const MeasureBar = ({
  currentMeasureIndex,
  totalMeasures,
  onAddMeasure,
  onDeleteMeasure,
  onNavigateMeasure,
}: MeasureBarProps) => {
  const handlePrevClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigateMeasure('prev');
  };

  const handleNextClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigateMeasure('next');
  };

  const handleAddClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddMeasure();
  };

  const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 非活性の時は何もしない
    if (totalMeasures <= 1) {
      return;
    }
    if (window.confirm('この小節を削除してもよろしいですか？')) {
      onDeleteMeasure();
    }
  };

  return (
    <div
      css={css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 50px;
        background-color: #444;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 10px;
        box-sizing: border-box;
        z-index: 999;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      `}
    >
      {/* -ボタン */}
      <button
        onClick={handleDeleteClick}
        onTouchEnd={handleDeleteClick}
        disabled={totalMeasures <= 1}
        css={css`
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid #ef9a9a;
          background-color: ${totalMeasures <= 1 ? '#ccc' : '#ffcdd2'};
          color: ${totalMeasures <= 1 ? '#888' : '#c62828'};
          font-size: 24px;
          font-weight: bold;
          cursor: ${totalMeasures <= 1 ? 'not-allowed' : 'pointer'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-sizing: border-box;
          opacity: ${totalMeasures <= 1 ? 0.5 : 1};
          
          &:hover:not(:disabled) {
            background-color: #ef9a9a;
            transform: scale(1.05);
          }
          
          &:active:not(:disabled) {
            transform: scale(0.95);
          }
        `}
        title="現在の小節を削除"
      >
        −
      </button>

      {/* 前へボタン、小節数表示、次へボタンのグループ */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 4px;
        `}
      >
        {/* 前へボタン */}
        <button
          onClick={handlePrevClick}
          onTouchEnd={handlePrevClick}
          disabled={currentMeasureIndex === 0}
          css={css`
            width: 52px;
            height: 48px;
            border-radius: 8px;
            border: 2px solid #666;
            background-color: ${currentMeasureIndex === 0 ? '#555' : '#666'};
            color: white;
            font-size: 22px;
            cursor: ${currentMeasureIndex === 0 ? 'not-allowed' : 'pointer'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            box-sizing: border-box;
            opacity: ${currentMeasureIndex === 0 ? 0.5 : 1};
            
            &:hover:not(:disabled) {
              background-color: #777;
              transform: scale(1.05);
            }
            
            &:active:not(:disabled) {
              transform: scale(0.95);
            }
          `}
          title="前の小節へ"
        >
          &lt;
        </button>

        {/* 小節数ラベル */}
        <div
          css={css`
            color: white;
            font-size: 16px;
            font-weight: bold;
            min-width: 60px;
            text-align: center;
          `}
        >
          {currentMeasureIndex + 1}/{totalMeasures}
        </div>

        {/* 次へボタン */}
        <button
          onClick={handleNextClick}
          onTouchEnd={handleNextClick}
          disabled={currentMeasureIndex >= totalMeasures - 1}
          css={css`
            width: 52px;
            height: 48px;
            border-radius: 8px;
            border: 2px solid #666;
            background-color: ${currentMeasureIndex >= totalMeasures - 1 ? '#555' : '#666'};
            color: white;
            font-size: 22px;
            cursor: ${currentMeasureIndex >= totalMeasures - 1 ? 'not-allowed' : 'pointer'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            box-sizing: border-box;
            opacity: ${currentMeasureIndex >= totalMeasures - 1 ? 0.5 : 1};
            
            &:hover:not(:disabled) {
              background-color: #777;
              transform: scale(1.05);
            }
            
            &:active:not(:disabled) {
              transform: scale(0.95);
            }
          `}
          title="次の小節へ"
        >
          &gt;
        </button>
      </div>

      {/* +ボタン */}
      <button
        onClick={handleAddClick}
        onTouchEnd={handleAddClick}
        css={css`
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid #a5d6a7;
          background-color: #c8e6c9;
          color: #2e7d32;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-sizing: border-box;
          
          &:hover {
            background-color: #a5d6a7;
            transform: scale(1.05);
          }
          
          &:active {
            transform: scale(0.95);
          }
        `}
        title="小節を保存して新規作成"
      >
        +
      </button>
    </div>
  );
};

