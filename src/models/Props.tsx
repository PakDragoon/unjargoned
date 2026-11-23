import React from "react";
import { C } from "../shorts/dots/theme";
export type PropKind =
  | "knife"
  | "pages"
  | "funnel"
  | "scratchpad"
  | "cabinet"
  | "laptop"
  | "folder"
  | "rubber";
export const Prop = ({
  kind,
  width = 350,
  step = 3,
  motion = 0,
}: {
  kind: PropKind;
  width?: number;
  step?: number;
  motion?: number;
}) => (
  <svg
    width={width}
    height={width * 0.72}
    viewBox="0 0 300 216"
    stroke={C.ink}
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill={C.paper}
  >
    {kind === "knife" && (
      <g transform="rotate(-12 150 120)">
        <path d="M75 135 L15 47 Q60 40 104 117Z" />
        <path d="M123 130 L123 25 L139 18 L145 32 L137 45 L147 58 L136 72 L150 87 L151 128Z" />
        <path d="M171 130 L247 44 L268 43 Q265 82 201 137Z" />
        <rect x="41" y="115" width="217" height="62" rx="31" fill={C.red} />
        <circle cx="72" cy="145" r="9" />
        <circle cx="230" cy="145" r="8" />
        <path d="M130 146h40m-20 -15v30" stroke={C.paper} strokeWidth="9" />
      </g>
    )}
    {kind === "pages" && (
      <g>
        <path
          d="M50 30h150v165H50z"
          fill={C.sand}
          transform="rotate(-9 125 110)"
        />
        <path d="M59 23h156v167H59z" />
        {[52, 71, 90, 109, 128].map((y, i) => (
          <path key={y} d={`M78 ${y}h${i % 2 ? 78 : 108}`} />
        ))}
        <g transform={`translate(${22 * (1 - motion)} 0)`}>
          <path
            d="M147 119h35q-7-22 10-22t11 22h35v56h-34q6 19-10 19t-12-19h-35z"
            fill={C.red}
          />
          <text
            x="166"
            y="159"
            fontSize="32"
            stroke="none"
            fill={C.ink}
            fontWeight="700"
          >
            &lt;/&gt;
          </text>
        </g>
      </g>
    )}
    {kind === "funnel" && (
      <g>
        <ellipse cx="150" cy="75" rx="117" ry="32" fill={C.sand} />
        <path d="M33 76q118 58 234 0l-88 79v30l-57 15v-45z" fill={C.red} />
        <g transform={`translate(0 ${-28 * (1 - motion)})`}>
          <path d="M67 29l52 17-13 39-52-17z" fill={C.paper} />
          <path d="m74 43 16 11-20 4z" fill={C.ink} />
          <path d="M143 32v40m11-52v57m11-39v32" strokeWidth="8" />
          <rect
            x="187"
            y="26"
            width="57"
            height="53"
            transform="rotate(9 210 55)"
          />
          <path d="m198 43 32 5m-34 9 28 4" />
        </g>
      </g>
    )}
    {kind === "scratchpad" && (
      <g>
        <path d="M61 24h181v171H61z" fill={C.red} />
        <path d="M82 24v171" />
        {[58, 105, 151].map((y, i) => (
          <g key={y}>
            <rect x="100" y={y - 13} width="26" height="26" />
            <path d={`M145 ${y}h67`} />
            {i < step && (
              <path d={`m101 ${y} 9 11 22-28`} fill="none" strokeWidth="6" />
            )}
          </g>
        ))}
      </g>
    )}
    {kind === "cabinet" && (
      <g>
        <path d="M65 40l20-20h154v158l-21 19H65z" fill={C.sand} />
        <rect x="65" y="40" width="153" height="157" />
        {[50, 122].map((y, i) => (
          <g key={y} transform={`translate(${i && step >= 2 ? -13 : 0},0)`}>
            <rect
              x="76"
              y={y}
              width="132"
              height="63"
              fill={i ? C.red : C.sand}
            />
            <rect x="115" y={y + 17} width="52" height="10" />
          </g>
        ))}
      </g>
    )}
    {kind === "laptop" && (
      <g>
        <rect x="47" y="31" width="205" height="130" rx="9" fill={C.sand} />
        <rect x="58" y="43" width="183" height="106" />
        <path
          d="M101 83q49-42 98 0m-84 15q34-30 70 0m-53 14q18-15 36 0"
          fill="none"
        />
        <path d="m110 54 85 85" stroke={C.red} strokeWidth="10" />
        <path d="M48 161h203l28 28H20z" fill={C.sand} />
      </g>
    )}
    {kind === "folder" && (
      <g>
        <path d="M29 69V49h87l21 19h131v117H29z" fill={C.red} />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={59 + i * 17}
            y={28 + i * 9}
            width="141"
            height="110"
            transform={`rotate(${i * 5 - 8 + 12 * Math.sin(motion * Math.PI * 2 + i)} 130 90)`}
          />
        ))}
        <path d="M20 100h250l-13 88H39z" fill={C.sand} />
      </g>
    )}
    {kind === "rubber" && (
      <g>
        <path
          d="M128 125v-19c0-22-27-31-27-56 0-45 97-45 97 0 0 25-27 34-27 56v19z"
          fill={C.red}
        />
        <rect x="66" y="120" width="168" height="37" rx="5" fill={C.sand} />
        <rect x="67" y="157" width="166" height="13" fill={C.ink} />
      </g>
    )}
  </svg>
);
