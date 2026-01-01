import { css } from "@emotion/react";

export const sheetWrapper = css`
  padding: 2% 0;
  touch-action: none;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  position: relative;
`;

export const iconContainer = css`
  width: 20%;
  float: left;
`;

export const icon = css`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #bbb;
  margin: 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const messageWrapper = css`
  p {
    margin: 0;
  }
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  clear: both;
`;

export const controlWrapper = css`
  border-top: 2px solid #444;
  position: relative;
  z-index: 101;
  background-color: #f5f5f5;
  box-sizing: border-box;
  clear: both;
`;

const barWrapperCss = css`
  background-color: transparent;
  width: 100%;
  height: 4.16666%;
  position: relative;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

export const blackBarWrapperCss = css`
  ${barWrapperCss};
  z-index: 100;
`;

export const whiteBarWrapperCss = css`
  ${barWrapperCss};
  z-index: auto;
`;

const barCss = css`
  width: 100%;
  height: 20%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
`;

export const blackLongBarCss = css`
  ${barCss};
  background-color: black;
`;

export const blackShortBarCss = css`
  ${barCss};
  background-color: black;
  width: 25%;
  left: 70%;
`;

export const whiteBarCss = css`
  ${barCss};
  height: 180%;
  background-color: transparent;
`;

export const fretLabel = css`
  height: 1.5em;
  clear: both;
  float: none;
  white-space: nowrap;
  min-width: max-content;
  display: block;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
`;

