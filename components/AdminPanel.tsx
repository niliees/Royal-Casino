"use client";
import { useState, useRef, useCallback, useEffect, ReactNode } from "react";
import { STARTING_BALANCE } from "@/lib/balance";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  balance: number;
  onSetBalance: (n: number) => void;
  children?: ReactNode;
}

export default function AdminPanel({
  isOpen, onClose, title, balance, onSetBalance, children,
}: AdminPanelProps) {
  const [balInput, setBalInput] = useState("");
  const [pos, setPos] = useState({ x: 24, y: 80 });
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select")) return;
    dragState.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragState.current) return;
      setPos({
        x: dragState.current.ox + e.clientX - dragState.current.sx,
        y: dragState.current.oy + e.clientY - dragState.current.sy,
      });
    }
    function onUp() { dragState.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "fixed", top: pos.y, left: pos.x, zIndex: 9999,
        width: 296,
        background: "rgba(8,6,18,0.97)",
        border: "1px solid rgba(201,168,76,0.45)",
        borderRadius: 12,
        boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,76,0.08)",
        color: "#f0e6c8", fontFamily: "monospace", fontSize: 12,
        cursor: "move", userSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
        background: "rgba(201,168,76,0.06)",
        borderRadius: "12px 12px 0 0",
      }}>
        <span style={{ color: "#c9a84c", letterSpacing: 2, fontSize: 10, textTransform: "uppercase", fontWeight: "bold" }}>
          Admin &mdash; {title}
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "rgba(240,230,200,0.5)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0, userSelect: "none" }}
        >&times;</button>
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Balance */}
        <div>
          <div style={{ color: "rgba(240,230,200,0.4)", letterSpacing: 1, marginBottom: 6, fontSize: 10, textTransform: "uppercase" }}>
            Balance Control
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 17, color: "#c9a84c", fontWeight: "bold", marginBottom: 8 }}>
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input
              type="number"
              placeholder="Set balance..."
              value={balInput}
              onChange={e => setBalInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const n = parseFloat(balInput);
                  if (!isNaN(n) && n >= 0) { onSetBalance(n); setBalInput(""); }
                }
              }}
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
                color: "#f0e6c8", padding: "6px 10px", fontFamily: "monospace", fontSize: 12,
                outline: "none",
              }}
            />
            <button
              onClick={() => { const n = parseFloat(balInput); if (!isNaN(n) && n >= 0) { onSetBalance(n); setBalInput(""); } }}
              style={{
                padding: "6px 12px", background: "rgba(201,168,76,0.2)",
                border: "1px solid rgba(201,168,76,0.4)", borderRadius: 6,
                color: "#c9a84c", cursor: "pointer", fontSize: 12,
              }}
            >Set</button>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[100, 500, 1000, 5000].map(v => (
              <button
                key={v}
                onClick={() => onSetBalance(balance + v)}
                style={{
                  flex: 1, padding: "5px 0",
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                  borderRadius: 5, color: "#4ade80", cursor: "pointer", fontSize: 11,
                }}
              >+${v}</button>
            ))}
          </div>
          <button
            onClick={() => onSetBalance(STARTING_BALANCE)}
            style={{
              width: "100%", padding: "6px 0",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 6, color: "#f87171", cursor: "pointer", fontSize: 11, letterSpacing: 1,
            }}
          >RESET TO $1,000</button>
        </div>

        {/* Game-specific children */}
        {children && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
