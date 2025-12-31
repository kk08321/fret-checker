/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { controlWrapper, iconContainer, icon, messageWrapper, fretLabel } from "../styles/sheetPageStyles";

interface ControlPanelProps {
  notes: string[];
  controlWrapperRef: React.RefObject<HTMLDivElement>;
}

function ControlPanel({ notes, controlWrapperRef }: ControlPanelProps) {
  return (
    <div css={controlWrapper} ref={controlWrapperRef}>
      <div css={iconContainer}>
        <div css={icon}></div>
      </div>
      <div css={iconContainer}>
        <div css={icon}></div>
      </div>
      <div css={iconContainer}>
        <div css={icon}></div>
      </div>
      <div css={iconContainer}>
        <div css={icon}></div>
      </div>
      <div css={iconContainer}>
        <div css={icon}></div>
      </div>
      <div css={messageWrapper}>
        <p css={fretLabel}>{notes.length >= 1 && notes[0]}</p>
        <p css={fretLabel}>{notes.length >= 2 && notes[1]}</p>
        <p css={fretLabel}>{notes.length >= 3 && notes[2]}</p>
        <p css={fretLabel}>{notes.length >= 4 && notes[3]}</p>
        <p css={fretLabel}>{notes.length >= 5 && notes[4]}</p>
        <p css={fretLabel}>{notes.length >= 6 && notes[5]}</p>
      </div>
    </div>
  );
}

export default ControlPanel;

