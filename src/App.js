/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import SheetPage from "./SheetPage";
import Test from "./Test";

function App() {
  return (
    <div
      css={css`
        width: 100vw;
        height: 100vh;
      `}
    >
      <div
        css={css`
          width: 100%;
          height: 90%;
        `}
      >
        <SheetPage />
      </div>
      <div
        css={css`
          width: 100%;
          height: 10%;
          background-color: gray;
        `}
      >
        <div
          css={css`
            width: 33.33%;
            float: left;
          `}
        >
          a
        </div>
        <div
          css={css`
            width: 33.33%;
            float: left;
          `}
        >
          b
        </div>
        <div
          css={css`
            width: 33.33%;
            float: left;
          `}
        >
          c
        </div>
      </div>
    </div>
  );
}

export default App;
