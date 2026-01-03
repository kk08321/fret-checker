/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

interface MeasureBarProps {
  currentMeasureIndex: number;
  totalMeasures: number;
  onAddMeasure: () => void;
  onDeleteMeasure: () => void;
  onNavigateMeasure: (direction: 'prev' | 'next') => void;
  onOpenModal?: () => void;
}

export const MeasureBar = ({
  currentMeasureIndex,
  totalMeasures,
  onAddMeasure,
  onDeleteMeasure,
  onNavigateMeasure,
  onOpenModal,
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
        background-color: #f2f2f7;
        border-bottom: 1px solid #e0e0e0;
        border-radius: 0 0 12px 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 10px;
        box-sizing: border-box;
        z-index: 999;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      `}
    >
      {/* -ボタン */}
      <button
        onClick={handleDeleteClick}
        onTouchEnd={handleDeleteClick}
        disabled={totalMeasures <= 1}
        css={css`
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid ${totalMeasures <= 1 ? '#ddd' : '#ef9a9a'};
          background-color: ${totalMeasures <= 1 ? '#e0e0e0' : '#ffebee'};
          color: ${totalMeasures <= 1 ? '#999' : '#c62828'};
          font-size: 24px;
          font-weight: bold;
          cursor: ${totalMeasures <= 1 ? 'not-allowed' : 'pointer'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-sizing: border-box;
          opacity: ${totalMeasures <= 1 ? 0.6 : 1};
          
          &:hover:not(:disabled) {
            background-color: #ffcdd2;
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
            width: 48px;
            height: 44px;
            border-radius: 10px;
            border: 1px solid ${currentMeasureIndex === 0 ? '#ddd' : '#bbb'};
            background-color: ${currentMeasureIndex === 0 ? '#f0f0f0' : '#fff'};
            color: ${currentMeasureIndex === 0 ? '#bbb' : '#333'};
            font-size: 22px;
            cursor: ${currentMeasureIndex === 0 ? 'not-allowed' : 'pointer'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            box-sizing: border-box;
            opacity: ${currentMeasureIndex === 0 ? 0.6 : 1};
            
            &:hover:not(:disabled) {
              background-color: #f5f5f5;
              border-color: #999;
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

        {/* 小節数ラベルと再生アイコン */}
        <div
          onClick={onOpenModal ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenModal();
          } : undefined}
          onTouchEnd={onOpenModal ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenModal();
          } : undefined}
          css={css`
            display: flex;
            align-items: center;
            gap: 6px;
            color: #333;
            font-size: 16px;
            font-weight: bold;
            min-width: ${onOpenModal ? '80px' : '60px'};
            text-align: center;
            justify-content: center;
            ${onOpenModal ? `
              cursor: pointer;
              user-select: none;
              -webkit-user-select: none;
              padding: 4px 8px;
              border-radius: 8px;
              transition: all 0.2s;
              
              &:hover {
                background-color: rgba(76, 175, 80, 0.1);
              }
              
              &:active {
                background-color: rgba(76, 175, 80, 0.15);
                transform: scale(0.95);
              }
            ` : ''}
          `}
        >
          <span>{currentMeasureIndex + 1}/{totalMeasures}</span>
          {onOpenModal && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              css={css`
                color: #4CAF50;
                flex-shrink: 0;
              `}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        {/* 次へボタン */}
        <button
          onClick={handleNextClick}
          onTouchEnd={handleNextClick}
          disabled={currentMeasureIndex >= totalMeasures - 1}
          css={css`
            width: 48px;
            height: 44px;
            border-radius: 10px;
            border: 1px solid ${currentMeasureIndex >= totalMeasures - 1 ? '#ddd' : '#bbb'};
            background-color: ${currentMeasureIndex >= totalMeasures - 1 ? '#f0f0f0' : '#fff'};
            color: ${currentMeasureIndex >= totalMeasures - 1 ? '#bbb' : '#333'};
            font-size: 22px;
            cursor: ${currentMeasureIndex >= totalMeasures - 1 ? 'not-allowed' : 'pointer'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            box-sizing: border-box;
            opacity: ${currentMeasureIndex >= totalMeasures - 1 ? 0.6 : 1};
            
            &:hover:not(:disabled) {
              background-color: #f5f5f5;
              border-color: #999;
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
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid #a5d6a7;
          background-color: #e8f5e9;
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
            background-color: #c8e6c9;
            border-color: #81c784;
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

