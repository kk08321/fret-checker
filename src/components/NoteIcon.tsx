/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { NoteValue } from '../contexts/MeasureContext';

interface NoteIconProps {
  value: NoteValue;
  size?: number;
  color?: string;
  isStemDown?: boolean;
  simple?: boolean; // シンプルな楕円モード
  noteNumber?: number | null; // 番号（simpleモード用）
}

// SVGファイルから抽出した美しい音符のパスを使用
export const NoteIcon = ({ 
  value, 
  size = 28, 
  color = '#000',
  isStemDown = false,
  simple = false,
  noteNumber = null
}: NoteIconProps): React.ReactElement => {
  // シンプルモードの場合は単純な楕円を表示
  if (simple) {
    return (
      <div
        css={css`
          position: relative;
          width: ${size}px;
          height: ${size * 0.7}px;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <div
          css={css`
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: ${color};
            border: 1px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          `}
        />
        {noteNumber !== null && (
          <div
            css={css`
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #fff;
              font-size: ${size * 0.4}px;
              font-weight: bold;
              line-height: 1;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            `}
          >
            {noteNumber}
          </div>
        )}
      </div>
    );
  }
  if (value === 'whole') {
    // 全音符
    return (
      <svg
        width={size}
        height={size * 0.7}
        viewBox="798 392 31 46"
        css={css`
          fill: ${color};
          stroke: none;
        `}
      >
        <path d="M808.2,403c-11.1,0-20.2,6.4-20.2,14.4c0,8,9,14.4,20.2,14.4c11.1,0,20.2-6.4,20.2-14.4C828.4,409.5,819.4,403,808.2,403z    M811.3,429.3c-4.7,1.2-9.8-3.1-11.5-9.7c-1.7-6.5,0.7-12.8,5.4-14c4.7-1.2,9.8,3.1,11.5,9.7C818.3,421.8,815.9,428.1,811.3,429.3z   "/>
      </svg>
    );
  } else if (value === 'half') {
    // 二分音符
    if (isStemDown) {
      return (
        <svg
          width={size}
          height={size * 1.8}
          viewBox="165 216 23 115"
          css={css`
            fill: ${color};
            stroke: none;
          `}
        >
          <path d="M188.3,216.6c-3.1-5.3-11.7-6-19-1.6c-5.5,3.3-8.8,8.5-8.9,13.1h0v99.1h2.5v-93c3.8,3.7,11.2,3.8,17.7-0.1   C188,229.7,191.4,221.8,188.3,216.6z M177.9,229c-5.6,3.3-10.8,5.5-13.1,1.5c-2.4-4,2.3-6.8,7.9-10.2c5.6-3.3,10-5.9,12.3-1.9   C187.4,222.5,183.5,225.7,177.9,229z"/>
        </svg>
      );
    } else {
      return (
        <svg
          width={size}
          height={size * 1.8}
          viewBox="907 81 23 115"
          css={css`
            fill: ${color};
            stroke: none;
          `}
        >
          <path d="M919.2,81.4v93c-3.8-3.7-11.2-3.8-17.7,0.1c-7.4,4.4-10.8,12.2-7.7,17.5c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0   V81.4H919.2z M909.4,188.2c-5.6,3.3-10,5.9-12.3,1.9c-2.4-4,1.5-7.2,7.1-10.5c5.6-3.3,10.8-5.5,13.1-1.5   C919.7,182,915,184.9,909.4,188.2z"/>
        </svg>
      );
    }
  } else if (value === 'quarter') {
    // 四分音符
    if (isStemDown) {
      return (
        <svg
          width={size}
          height={size * 1.8}
          viewBox="260 216 30 115"
          css={css`
            fill: ${color};
            stroke: none;
          `}
        >
          <path d="M280.3,216.6c-3.1-5.3-11.7-6-19-1.6c-5.5,3.3-8.8,8.5-8.9,13.1h0v99.1h2.5v-93c3.8,3.7,11.2,3.8,17.7-0.1   C280,229.7,283.4,221.8,280.3,216.6z"/>
        </svg>
      );
    } else {
      return (
        <svg
          width={size}
          height={size * 1.8}
          viewBox="170 81 30 115"
          css={css`
            fill: ${color};
            stroke: none;
          `}
        >
          <path d="M179.6,81.4v93c-3.8-3.7-11.2-3.8-17.7,0.1c-7.4,4.4-10.8,12.2-7.7,17.5c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0   V81.4H179.6z"/>
        </svg>
      );
    }
  } else {
    // 八分音符
    if (isStemDown) {
      return (
        <svg
        width={size}
        height={size * 1.8}
        viewBox="326 208 50 130"
        css={css`
            fill: ${color};
            stroke: none;
        `}
        >
          <path d="M350.9,285.9c-6.2,9.7-13.9,9.7-13.9,9.7v-61.4c3.8,3.7,11.2,3.8,17.7-0.1c7.4-4.4,10.8-12.2,7.7-17.5   c-3.1-5.3-11.7-6-19-1.6c-5.5,3.3-8.8,8.5-8.9,13.1h0v99.1h2.5c0-16.8,13.1-29.2,18.8-39.9c5.7-10.7,7.4-32.5-3.5-47.7   C358.7,254.1,360.9,270.2,350.9,285.9z"/>
        </svg>
      );
    } else {
      return (
        <svg
        width={size}
        height={size * 1.8}
        viewBox="230 75 80 140"
        css={css`
            fill: ${color};
            stroke: none;
        `}
        >
          <path d="M282.2,121.3c-5.7-10.7-18.8-23.2-18.8-39.9h-2.5v93c-3.8-3.7-11.2-3.8-17.7,0.1c-7.4,4.4-10.8,12.2-7.7,17.5   c3.1,5.3,11.7,6,19,1.6c5.5-3.3,8.8-8.5,8.9-13.1h0V113c0,0,7.7,0,13.9,9.7c10.1,15.7,7.9,31.8,1.4,46.3   C289.7,153.8,287.9,132,282.2,121.3z"/>
        </svg>
      );
    }
  }
};
