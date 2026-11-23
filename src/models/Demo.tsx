import React from "react";
import { CloudWindow } from "../shorts/dots/kit";
import { C } from "../shorts/dots/theme";
import { mono, progress } from "./Editorial";

export const Window = ({
  right = false,
  title,
  t,
  at = 0,
  children,
}: React.PropsWithChildren<{
  right?: boolean;
  title: string;
  t: number;
  at?: number;
}>) => {
  const p = progress(t, at, 0.5);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 50}px)` }}>
      <CloudWindow
        rect={{ cx: right ? 1400 : 520, cy: 575, w: 820, h: 580 }}
        url={title}
      >
        <div
          style={{
            height: "100%",
            boxSizing: "border-box",
            padding: "35px 40px",
            background: C.paper,
            fontSize: 34,
            lineHeight: 1.23,
          }}
        >
          {children}
        </div>
      </CloudWindow>
    </div>
  );
};
export const Label = ({ children }: React.PropsWithChildren) => (
  <div style={{ ...mono, fontSize: 22, color: "#564e43", marginBottom: 16 }}>
    {children}
  </div>
);
export const Slip = ({
  children,
  hot = false,
}: React.PropsWithChildren<{ hot?: boolean }>) => (
  <div
    style={{
      background: hot ? "#ffded4" : "#fffdf6",
      border: "3px solid",
      borderLeft: `11px solid ${hot ? C.red : C.ink}`,
      padding: "15px 22px",
      margin: "14px 0",
      fontSize: 32,
    }}
  >
    {children}
  </div>
);
export const Wave = ({ t }: { t: number }) => (
  <svg
    width="100%"
    height="75"
    viewBox="0 0 720 75"
    aria-label="Voice waveform"
  >
    {Array.from({ length: 76 }, (_, i) => {
      const h =
        7 + 48 * Math.abs(Math.sin(i * 0.68 + t * 2) * Math.cos(i * 0.21 + t));
      return (
        <rect
          key={i}
          x={i * 9.5}
          y={(75 - h) / 2}
          width="5"
          height={h}
          rx="2"
          fill={C.red}
        />
      );
    })}
  </svg>
);
