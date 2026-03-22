"use client";

import React from "react";

interface Props {
  selected: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  /** Remaining balance (balance - already placed bets). Used to gray out unaffordable chips. */
  remainingBalance?: number;
}

const CHIPS = [
  { value: 1,       color: "#f0c040", textColor: "#1a1a1a", label: "1" },
  { value: 5,       color: "#e74c3c", textColor: "#fff",    label: "5" },
  { value: 10,      color: "#2980b9", textColor: "#fff",    label: "10" },
  { value: 25,      color: "#8e44ad", textColor: "#fff",    label: "25" },
  { value: 50,      color: "#1a7a3c", textColor: "#fff",    label: "50" },
  { value: 100,     color: "#222",    textColor: "#f0c040", label: "100" },
  { value: 500,     color: "#b45309", textColor: "#fef3c7", label: "500" },
  { value: 1000,    color: "#0e7490", textColor: "#fff",    label: "1K" },
  { value: 5000,    color: "#7c3aed", textColor: "#fff",    label: "5K" },
  { value: 10000,   color: "#be185d", textColor: "#fff",    label: "10K" },
  { value: 50000,   color: "#065f46", textColor: "#6ee7b7", label: "50K" },
  { value: 100000,  color: "#1e3a5f", textColor: "#93c5fd", label: "100K" },
  { value: 1000000, color: "#1a0a00", textColor: "#fb923c", label: "1M" },
];

export default function ChipSelector({ selected, onSelect, disabled, remainingBalance }: Props) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      {CHIPS.map(({ value, color, textColor, label }) => {
        const isSelected = selected === value;
        const cantAfford = remainingBalance !== undefined && value > remainingBalance;
        const isDisabled = disabled || cantAfford;
        return (
          <button
            key={value}
            onClick={() => !isDisabled && onSelect(value)}
            disabled={isDisabled}
            title={cantAfford ? `Not enough balance (need $${value.toLocaleString('en-US')})` : undefined}
            style={{
              width: isSelected ? 58 : 50,
              height: isSelected ? 58 : 50,
              borderRadius: "50%",
              background: cantAfford ? "#2a2a2a" : color,
              color: cantAfford ? "#555" : textColor,
              fontWeight: "bold",
              fontSize: isSelected ? 13 : 11,
              border: isSelected
                ? "3px solid #f0d878"
                : cantAfford
                  ? "2px solid #444"
                  : "2px solid rgba(255,255,255,0.3)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              boxShadow: isSelected && !cantAfford
                ? `0 0 20px ${color}, 0 4px 12px rgba(0,0,0,0.5)`
                : "0 3px 8px rgba(0,0,0,0.4)",
              transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              transform: isSelected && !cantAfford ? "translateY(-4px)" : "translateY(0)",
              opacity: cantAfford ? 0.4 : 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              outline: "none",
            }}
          >
            {/* Chip edge lines */}
            <div style={{
              position: "absolute",
              inset: 4,
              borderRadius: "50%",
              border: `2px dashed ${cantAfford ? "#555" : textColor}`,
              opacity: 0.4,
              pointerEvents: "none",
            }} />
            <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
