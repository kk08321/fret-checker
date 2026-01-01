/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

interface ModeBadgeProps {
  label: string;
  symbol: string;
}

export const ModeBadge = ({ label, symbol }: ModeBadgeProps) => {
  return (
    <div
      css={css`
        position: absolute;
        top: 58px;
        left: 50%;
        transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        background-color: rgba(74, 144, 226, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 8px;
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
      <span>{symbol}</span>
      <span>{label}</span>
    </div>
  );
};

