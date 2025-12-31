/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import SheetPage from "./SheetPage";
import Test from "./Test";
import FretboardPage from "./FretboardPage";
import { GuitarNotesProvider } from "./contexts/GuitarNotesContext";

function App() {
  return (
    <GuitarNotesProvider>
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
            <Route path={`/test/`} element={<Test />} />
            <Route path={`/fretboard/`} element={<FretboardPage />} />
          </Routes>
        </div>
        <div
          css={css`
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 60px;
            background-color: #333;
            display: flex;
            z-index: 1000;
          `}
        >
          <Link
            to="/sheet/"
            css={css`
              width: 33.33%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-decoration: none;
              font-size: 18px;
              &:hover {
                background-color: #444;
              }
            `}
          >
            a
          </Link>
          <Link
            to="/fretboard/"
            css={css`
              width: 33.33%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-decoration: none;
              font-size: 18px;
              &:hover {
                background-color: #444;
              }
            `}
          >
            b
          </Link>
          <Link
            to="/test/"
            css={css`
              width: 33.33%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-decoration: none;
              font-size: 18px;
              &:hover {
                background-color: #444;
              }
            `}
          >
            c
          </Link>
        </div>
      </div>
      </BrowserRouter>
    </GuitarNotesProvider>
  );
}

export default App;
