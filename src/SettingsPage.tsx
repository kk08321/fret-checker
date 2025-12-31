/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useKeySignature } from "./contexts/KeySignatureContext";
import { KEY_SIGNATURE_LIST, KeySignatureType } from "./utils/keySignature";
import { useTuning, TuningType } from "./contexts/TuningContext";

export default function SettingsPage() {
  const { selectedKeySignature, setSelectedKeySignature } = useKeySignature();
  const { tuning, setTuning } = useTuning();

  const handleKeySignatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedKeySignature(value === '' ? null : (value as KeySignatureType));
  };

  const handleTuningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTuning(value as TuningType);
  };

  return (
    <div
      css={css`
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
      `}
    >
      <h2
        css={css`
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        `}
      >
        設定
      </h2>
      <div
        css={css`
          margin-bottom: 20px;
        `}
      >
        <label
          htmlFor="keySignatureSelect"
          css={css`
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: bold;
            color: #555;
          `}
        >
          調号
        </label>
        <select
          id="keySignatureSelect"
          value={selectedKeySignature || ''}
          onChange={handleKeySignatureChange}
          css={css`
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background-color: white;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 40px;
            
            &:focus {
              outline: none;
              border-color: #4a90e2;
              box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
            }
          `}
        >
          <option value="">選択しない</option>
          {KEY_SIGNATURE_LIST.map((keySig) => (
            <option key={keySig.type} value={keySig.type}>
              {keySig.displayName}
            </option>
          ))}
        </select>
      </div>
      <div
        css={css`
          margin-bottom: 20px;
        `}
      >
        <label
          htmlFor="tuningSelect"
          css={css`
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: bold;
            color: #555;
          `}
        >
          チューニング
        </label>
        <select
          id="tuningSelect"
          value={tuning}
          onChange={handleTuningChange}
          css={css`
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background-color: white;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 40px;
            
            &:focus {
              outline: none;
              border-color: #4a90e2;
              box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
            }
          `}
        >
          <option value="normal">ノーマルチューニング (E-A-D-G-B-E)</option>
          <option value="dropD">ドロップDチューニング (D-A-D-G-B-E)</option>
        </select>
      </div>
    </div>
  );
}

