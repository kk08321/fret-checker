/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useKeySignature } from "./contexts/KeySignatureContext";
import { KEY_SIGNATURE_LIST, KeySignatureType } from "./utils/keySignature";
import { useTuning, TuningType } from "./contexts/TuningContext";
import { useAudioSettings } from "./contexts/AudioSettingsContext";

export default function SettingsPage() {
  const { selectedKeySignature, setSelectedKeySignature } = useKeySignature();
  const { tuning, setTuning } = useTuning();
  const { audioPlayback, setAudioPlayback } = useAudioSettings();

  const handleKeySignatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedKeySignature(value === '' ? null : (value as KeySignatureType));
  };

  const handleTuningChange = (value: TuningType) => {
    setTuning(value);
  };

  const handleAudioPlaybackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioPlayback(e.target.checked ? 'enabled' : 'disabled');
  };

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        padding: 0;
        padding-bottom: 75px;
        max-width: 600px;
        margin: 0 auto;
        box-sizing: border-box;
        overflow-y: auto;
        background-color: #f2f2f7;
      `}
    >
      <h2
        css={css`
          padding: 20px 20px 8px 20px;
          font-size: 34px;
          font-weight: 700;
          color: #000;
          margin: 0;
        `}
      >
        設定
      </h2>
      
      {/* 調号セクション */}
      <div
        css={css`
          margin-top: 32px;
          margin-bottom: 32px;
        `}
      >
        <div
          css={css`
            background-color: #ffffff;
            border-radius: 10px;
            margin: 0 20px;
            overflow: hidden;
          `}
        >
          <div
            css={css`
              padding: 12px 16px;
              border-bottom: 0.5px solid rgba(60, 60, 67, 0.29);
            `}
          >
            <label
              htmlFor="keySignatureSelect"
              css={css`
                display: block;
                font-size: 13px;
                font-weight: 400;
                color: rgba(60, 60, 67, 0.6);
                margin-bottom: 4px;
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
                padding: 0;
                font-size: 17px;
                font-weight: 400;
                border: none;
                background-color: transparent;
                color: #000;
                cursor: pointer;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 0 center;
                padding-right: 24px;
                
                &:focus {
                  outline: none;
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
        </div>
      </div>

      {/* チューニングセクション */}
      <div
        css={css`
          margin-bottom: 32px;
        `}
      >
        <div
          css={css`
            background-color: #ffffff;
            border-radius: 10px;
            margin: 0 20px;
            overflow: hidden;
          `}
        >
          <div
            css={css`
              padding: 12px 16px;
            `}
          >
            <label
              css={css`
                display: block;
                font-size: 13px;
                font-weight: 400;
                color: rgba(60, 60, 67, 0.6);
                margin-bottom: 8px;
              `}
            >
              チューニング
            </label>
            <div
              css={css`
                display: flex;
                background-color: rgba(120, 120, 128, 0.16);
                border-radius: 8.91px;
                padding: 2.5px;
                gap: 0;
              `}
            >
              <button
                type="button"
                onClick={() => handleTuningChange('normal')}
                css={css`
                  flex: 1;
                  padding: 7px 12px;
                  font-size: 15px;
                  font-weight: 600;
                  border: none;
                  border-radius: 6.67px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  background-color: ${tuning === 'normal' ? '#ffffff' : 'transparent'};
                  color: ${tuning === 'normal' ? '#007aff' : 'rgba(60, 60, 67, 0.6)'};
                  
                  &:active {
                    transform: scale(0.98);
                  }
                `}
              >
                ノーマル
              </button>
              <button
                type="button"
                onClick={() => handleTuningChange('dropD')}
                css={css`
                  flex: 1;
                  padding: 7px 12px;
                  font-size: 15px;
                  font-weight: 600;
                  border: none;
                  border-radius: 6.67px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  background-color: ${tuning === 'dropD' ? '#ffffff' : 'transparent'};
                  color: ${tuning === 'dropD' ? '#007aff' : 'rgba(60, 60, 67, 0.6)'};
                  
                  &:active {
                    transform: scale(0.98);
                  }
                `}
              >
                ドロップD
              </button>
            </div>
            <div
              css={css`
                margin-top: 8px;
                font-size: 13px;
                color: rgba(60, 60, 67, 0.6);
                padding-left: 0;
              `}
            >
              {tuning === 'normal' ? 'E-A-D-G-B-E' : 'D-A-D-G-B-E'}
            </div>
          </div>
        </div>
      </div>

      {/* 入力音の再生セクション */}
      <div
        css={css`
          margin-bottom: 32px;
        `}
      >
        <div
          css={css`
            background-color: #ffffff;
            border-radius: 10px;
            margin: 0 20px;
            overflow: hidden;
          `}
        >
          <label
            htmlFor="audioPlaybackToggle"
            css={css`
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 16px;
              font-size: 17px;
              font-weight: 400;
              color: #000;
              cursor: pointer;
              transition: background-color 0.1s ease;
              
              &:active {
                background-color: rgba(0, 0, 0, 0.05);
              }
            `}
          >
            <span>入力音の再生</span>
            <div
              css={css`
                position: relative;
                width: 51px;
                height: 31px;
                flex-shrink: 0;
              `}
            >
              <input
                type="checkbox"
                id="audioPlaybackToggle"
                checked={audioPlayback === 'enabled'}
                onChange={handleAudioPlaybackChange}
                css={css`
                  opacity: 0;
                  width: 0;
                  height: 0;
                  position: absolute;
                `}
              />
              <span
                css={css`
                  position: absolute;
                  cursor: pointer;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background-color: ${audioPlayback === 'enabled' ? '#34c759' : 'rgba(120, 120, 128, 0.16)'};
                  transition: background-color 0.3s ease;
                  border-radius: 15.5px;
                  
                  &:before {
                    position: absolute;
                    content: "";
                    height: 27px;
                    width: 27px;
                    left: 2px;
                    bottom: 2px;
                    background-color: white;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 50%;
                    transform: ${audioPlayback === 'enabled' ? 'translateX(20px)' : 'translateX(0)'};
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06);
                  }
                `}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

