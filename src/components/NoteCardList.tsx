/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from "@emotion/react";
import { useState } from "react";
import { NoteCard } from "./NoteCard";
import { parseNoteString, ParsedNote } from "../utils/noteParser";

interface NoteCardListProps {
  notes: string[]; // convertNoteToGuitarPositionsで生成された文字列の配列
  containerCss?: SerializedStyles; // 外部からスタイルを追加できるように
}

const listContainer = css`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch; /* iOS スムーススクロール */
`;

const listInner = css`
  padding: 12px 16px;
  box-sizing: border-box;
`;

export const NoteCardList = ({ notes, containerCss }: NoteCardListProps) => {
  // 選択状態: Map<noteIndex, fingeringIndex>
  // noteIndexは0-based、fingeringIndexも0-based
  const [selectedFingerings, setSelectedFingerings] = useState<Map<number, number>>(new Map());

  // notes配列をパース
  const parsedNotes: ParsedNote[] = notes.map(parseNoteString);

  const handleFingeringSelect = (noteIndex: number, fingeringIndex: number) => {
    setSelectedFingerings((prev) => {
      const newMap = new Map(prev);
      // 同じチップを再度選択した場合は選択を解除、そうでなければ選択
      if (newMap.get(noteIndex) === fingeringIndex) {
        newMap.delete(noteIndex);
      } else {
        newMap.set(noteIndex, fingeringIndex);
      }
      return newMap;
    });
  };

  return (
    <div css={[listContainer, containerCss]}>
      <div css={listInner}>
        {parsedNotes.map((note, noteIndex) => (
          <NoteCard
            key={noteIndex}
            index={noteIndex + 1}
            note={note}
            selectedFingeringIndex={selectedFingerings.get(noteIndex) ?? null}
            onFingeringSelect={(fingeringIndex) => handleFingeringSelect(noteIndex, fingeringIndex)}
          />
        ))}
      </div>
    </div>
  );
};

