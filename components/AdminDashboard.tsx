"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { RED_NUMBERS, BLACK_NUMBERS } from "@/lib/roulette";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  isSpinning: boolean;
  onSetBalance: (amount: number) => void;
  onSetForceNumber: (n: number | null) => void;
  forceNumber: number | null;
  infiniteBalance: boolean;
  onToggleInfiniteBalance: () => void;
  autoWin: boolean;
  onToggleAutoWin: () => void;
  onClearHistory: () => void;
  onResetGame: () => void;
  history: { number: number; timestamp: number }[];
  bets: { betKey: string; amount: number; numbers: number[]; label: string }[];
}

function getColor(n: number) {
  if (n === 0) return "#16a34a";
  if (RED_NUMBERS.has(n)) return "#dc2626";
  return "#1e1e1e";
}

export default function AdminDashboard({
  isOpen,
  onClose,
  balance,
  isSpinning,
  onSetBalance,
  onSetForceNumber,
  forceNumber,
  infiniteBalance,
  onToggleInfiniteBalance,
  autoWin,
  onToggleAutoWin,
  onClearHistory,
  onResetGame,
  history,
  bets,
}: AdminDashboardProps) {
  const [balanceInput, setBalanceInput] = useState("");
  const [activeTab, setActiveTab] = useState<"control" | "stats">("control");
  const [addBalanceInput, setAddBalanceInput] = useState("");

  // Drag support
  const panelRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [pos, setPos] = useState({ x: 24, y: 80 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select")) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragState.current) return;
      setPos({
        x: dragState.current.origX + (e.clientX - dragState.current.startX),
        y: dragState.current.origY + (e.clientY - dragState.current.startY),
      });
    };
    const up = () => { dragState.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  if (!isOpen) return null;

  const totalBet = bets.reduce((s, b) => s + b.amount, 0);
  const spinsCount = history.length;
  const redCount = history.filter((h) => RED_NUMBERS.has(h.number)).length;
  const blackCount = history.filter((h) => BLACK_NUMBERS.has(h.number)).length;
  const zeroCount = history.filter((h) => h.number === 0).length;
  const lastNumbers = history.slice(-5).reverse();

  const handleSetBalance = () => {
    const v = parseInt(balanceInput, 10);
    if (!isNaN(v) && v >= 0) {
      onSetBalance(v);
      setBalanceInput("");
    }
  };

  const handleAddBalance = () => {
    const v = parseInt(addBalanceInput, 10);
    if (!isNaN(v)) {
      onSetBalance(balance + v);
      setAddBalanceInput("");
    }
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: pos.x,
    top: pos.y,
    width: 360,
    maxHeight: "90vh",
    overflowY: "auto",
    zIndex: 9999,
    background: "linear-gradient(160deg, #0d0d0d 0%, #111827 100%)",
    border: "1px solid #22c55e",
    borderRadius: 12,
    boxShadow: "0 0 40px rgba(34,197,94,0.25), 0 20px 60px rgba(0,0,0,0.8)",
    fontFamily: "'Courier New', Courier, monospace",
    color: "#e2e8f0",
    userSelect: "none",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(34,197,94,0.3)",
    cursor: "move",
    background: "rgba(34,197,94,0.07)",
  };

  const sectionStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: 2,
    color: "#22c55e",
    textTransform: "uppercase",
    marginBottom: 8,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.6)",
    border: "1px solid rgba(34,197,94,0.4)",
    borderRadius: 6,
    color: "#e2e8f0",
    padding: "6px 10px",
    fontSize: 13,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const btnPrimary: React.CSSProperties = {
    background: "linear-gradient(90deg,#16a34a,#22c55e)",
    border: "none",
    borderRadius: 6,
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 1,
  };

  const btnDanger: React.CSSProperties = {
    background: "rgba(220,38,38,0.15)",
    border: "1px solid rgba(220,38,38,0.5)",
    borderRadius: 6,
    color: "#f87171",
    fontWeight: "bold",
    fontSize: 11,
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 1,
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    width: 40,
    height: 22,
    borderRadius: 11,
    background: active ? "#22c55e" : "rgba(255,255,255,0.1)",
    border: active ? "1px solid #16a34a" : "1px solid rgba(255,255,255,0.2)",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    flexShrink: 0,
  });

  const toggleKnobStyle = (active: boolean): React.CSSProperties => ({
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: active ? "#000" : "#666",
    top: 2,
    left: active ? 20 : 2,
    transition: "left 0.2s",
  });

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "7px 0",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    background: active ? "rgba(34,197,94,0.15)" : "transparent",
    border: "none",
    borderBottom: active ? "2px solid #22c55e" : "2px solid transparent",
    color: active ? "#22c55e" : "#6b7280",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  });

  return (
    <div ref={panelRef} style={panelStyle} onMouseDown={onMouseDown}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#22c55e", fontSize: 16 }}>⬡</span>
          <span style={{ fontSize: 12, fontWeight: "bold", letterSpacing: 2, color: "#22c55e", textTransform: "uppercase" }}>
            Admin Console
          </span>
          <span style={{
            fontSize: 9,
            background: "rgba(34,197,94,0.2)",
            color: "#22c55e",
            border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: 4,
            padding: "1px 6px",
            letterSpacing: 1,
          }}>
            DEV
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 2 }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button style={tabStyle(activeTab === "control")} onClick={() => setActiveTab("control")}>Control</button>
        <button style={tabStyle(activeTab === "stats")} onClick={() => setActiveTab("stats")}>Stats</button>
      </div>

      {activeTab === "control" && (
        <>
          {/* Status Row */}
          <div style={{ ...sectionStyle, display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>BALANCE</div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#f0d878" }}>${balance.toLocaleString('en-US')}</div>
            </div>
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>CURRENT BET</div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#c084fc" }}>${totalBet.toLocaleString('en-US')}</div>
            </div>
          </div>

          {/* Force Next Number */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Force Next Number</span>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: 3,
              marginBottom: 8,
            }}>
              {/* Zero */}
              <button
                onClick={() => onSetForceNumber(forceNumber === 0 ? null : 0)}
                style={{
                  gridColumn: "span 2",
                  padding: "5px 4px",
                  fontSize: 11,
                  fontWeight: "bold",
                  borderRadius: 4,
                  border: forceNumber === 0 ? "2px solid #22c55e" : "1px solid rgba(255,255,255,0.15)",
                  background: forceNumber === 0 ? "rgba(22,163,74,0.4)" : "#16a34a",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >0</button>
              {/* 1-36 */}
              {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => onSetForceNumber(forceNumber === n ? null : n)}
                  style={{
                    padding: "5px 2px",
                    fontSize: 10,
                    fontWeight: "bold",
                    borderRadius: 4,
                    border: forceNumber === n ? "2px solid #22c55e" : "1px solid rgba(255,255,255,0.1)",
                    background: forceNumber === n
                      ? "rgba(22,163,74,0.4)"
                      : getColor(n),
                    color: "#fff",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: forceNumber === n ? "0 0 8px rgba(34,197,94,0.6)" : "none",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            {forceNumber !== null ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, padding: "6px 10px" }}>
                <span style={{ fontSize: 12, color: "#22c55e" }}>
                  ▶ Next spin will land on: <strong style={{ color: "#4ade80" }}>{forceNumber}</strong>
                </span>
                <button onClick={() => onSetForceNumber(null)} style={{ ...btnDanger, padding: "3px 8px", fontSize: 10 }}>✕ Clear</button>
              </div>
            ) : (
              <div style={{ fontSize: 10, color: "#4b5563", textAlign: "center", padding: "2px 0" }}>
                Click a number to force the next spin result
              </div>
            )}
          </div>

          {/* Balance Controls */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Balance Control</span>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Set balance to..."
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetBalance()}
                type="number"
                min="0"
              />
              <button style={btnPrimary} onClick={handleSetBalance}>SET</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Add/subtract..."
                value={addBalanceInput}
                onChange={(e) => setAddBalanceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddBalance()}
                type="number"
              />
              <button style={btnPrimary} onClick={handleAddBalance}>ADD</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1000, 5000, 10000, 50000].map((amt) => (
                <button
                  key={amt}
                  style={{ ...btnPrimary, fontSize: 11, padding: "5px 10px" }}
                  onClick={() => onSetBalance(amt)}
                >
                  ${amt.toLocaleString('en-US')}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={sectionStyle}>
            <span style={labelStyle}>Modifiers</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Infinite Balance */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0" }}>Infinite Balance</div>
                  <div style={{ fontSize: 10, color: "#4b5563" }}>Skip all balance checks</div>
                </div>
                <div style={toggleStyle(infiniteBalance)} onClick={onToggleInfiniteBalance}>
                  <div style={toggleKnobStyle(infiniteBalance)} />
                </div>
              </div>
              {/* Auto Win */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#e2e8f0" }}>Auto Win</div>
                  <div style={{ fontSize: 10, color: "#4b5563" }}>Every spin wins current bets</div>
                </div>
                <div style={toggleStyle(autoWin)} onClick={onToggleAutoWin}>
                  <div style={toggleKnobStyle(autoWin)} />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ ...sectionStyle, borderBottom: "none" }}>
            <span style={labelStyle}>Actions</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnDanger} onClick={onClearHistory}>Clear History</button>
              <button style={{ ...btnDanger, borderColor: "rgba(239,68,68,0.8)", color: "#ef4444" }} onClick={onResetGame}>
                Reset Game
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "stats" && (
        <div style={{ padding: "12px 16px" }}>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "10px 8px", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#e2e8f0" }}>{spinsCount}</div>
              <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 1 }}>SPINS</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "10px 8px", border: "1px solid rgba(220,38,38,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#f87171" }}>{redCount}</div>
              <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 1 }}>RED</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "10px 8px", border: "1px solid rgba(255,255,255,0.15)", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#e2e8f0" }}>{blackCount}</div>
              <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 1 }}>BLACK</div>
            </div>
          </div>

          {/* Zero + Percentages */}
          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "10px 12px", marginBottom: 14, border: "1px solid rgba(22,163,74,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#4ade80" }}>Green 0: {zeroCount}</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{spinsCount ? ((zeroCount / spinsCount) * 100).toFixed(1) : "0.0"}%</span>
            </div>
            {spinsCount > 0 && (
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${(redCount / spinsCount) * 100}%`, background: "#dc2626", transition: "width 0.3s" }} />
                <div style={{ width: `${(blackCount / spinsCount) * 100}%`, background: "#374151", transition: "width 0.3s" }} />
                <div style={{ width: `${(zeroCount / spinsCount) * 100}%`, background: "#16a34a", transition: "width 0.3s" }} />
              </div>
            )}
          </div>

          {/* Last Results */}
          <div>
            <span style={labelStyle}>Last 5 Results</span>
            <div style={{ display: "flex", gap: 6 }}>
              {lastNumbers.length === 0 ? (
                <span style={{ fontSize: 11, color: "#4b5563" }}>No spins yet</span>
              ) : (
                lastNumbers.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: getColor(h.number),
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: 13,
                      color: "#fff",
                    }}
                  >
                    {h.number}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Bets */}
          {bets.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <span style={labelStyle}>Active Bets ({bets.length})</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                {bets.map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "4px 8px" }}>
                    <span>{b.label}</span>
                    <span style={{ color: "#f0d878" }}>${b.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#374151", letterSpacing: 1 }}>ROYAL ROULETTE · ADMIN</span>
        <span style={{ fontSize: 9, color: isSpinning ? "#22c55e" : "#374151", letterSpacing: 1 }}>
          {isSpinning ? "● SPINNING" : "○ IDLE"}
        </span>
      </div>
    </div>
  );
}
