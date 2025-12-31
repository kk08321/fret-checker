/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

type AccidentalType = "sharp" | "flat" | "natural";

interface AccidentalIconProps {
  type: AccidentalType;
  size?: number;
  className?: string;
  filter?: string;
}

export const AccidentalIcon = ({ 
  type, 
  size = 28, 
  className,
  filter 
}: AccidentalIconProps) => {
  const imageMap: Record<AccidentalType, string> = {
    sharp: "/images/sharp.png",
    flat: "/images/flat.png",
    natural: "/images/natural.png",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 136 464"
      css={css`
        width: ${size}px;
        height: ${size}px;
      `}
      className={className}
      style={filter ? { filter } : undefined}
    >
      <image
        href={imageMap[type]}
        x="0"
        y="0"
        width="136"
        height="464"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};

