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
      <span>{symbol}</span>
      <span>{label}</span>
    </div>
  );
};

