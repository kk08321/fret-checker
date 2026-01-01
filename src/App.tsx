/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SheetPage from "./SheetPage";
import SettingsPage from "./SettingsPage";
import FretboardPage from "./FretboardPage";
import { GuitarNotesProvider } from "./contexts/GuitarNotesContext";
import { KeySignatureProvider } from "./contexts/KeySignatureContext";
import { TuningProvider } from "./contexts/TuningContext";
import { AudioSettingsProvider } from "./contexts/AudioSettingsContext";
import { NavigationBar } from "./components/NavigationBar";

function App() {
  return (
    <GuitarNotesProvider>
      <KeySignatureProvider>
        <TuningProvider>
          <AudioSettingsProvider>
            <BrowserRouter>
            <div
              css={css`
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
              `}
            >
              <div
                css={css`
                  width: 100%;
                  flex: 1;
                  overflow-y: auto;
                  overflow-x: hidden;
                  min-height: 0;
                `}
              >
                <Routes>
                  <Route path={`/`} element={<SheetPage />} />
                  <Route path={`/sheet/`} element={<SheetPage />} />
                  <Route path={`/settings/`} element={<SettingsPage />} />
                  <Route path={`/fretboard/`} element={<FretboardPage />} />
                </Routes>
              </div>
              <NavigationBar />
            </div>
            </BrowserRouter>
          </AudioSettingsProvider>
        </TuningProvider>
      </KeySignatureProvider>
    </GuitarNotesProvider>
  );
}

export default App;
