"use client";
import Link from "next/link";

interface GameNavProps {
  balance: number;
  title?: string;
}

export default function GameNav({ balance, title = "Royal Casino" }: GameNavProps) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,8,20,0.95)",
      borderBottom: "1px solid rgba(201,168,76,0.2)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 56,
    }}>
      <Link href="/" style={{
        display: "flex", alignItems: "center", gap: 8,
        color: "rgba(240,230,200,0.7)", textDecoration: "none",
        fontSize: 14, fontFamily: "monospace",
        transition: "color 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,230,200,0.7)")}
      >
        &#8249; Lobby
      </Link>

      <span style={{
        fontFamily: "Georgia, serif",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 2,
        color: "#c9a84c",
        textTransform: "uppercase",
      }}>
        {title}
      </span>

      <span suppressHydrationWarning style={{
        fontFamily: "monospace",
        fontSize: 15,
        color: "#c9a84c",
        background: "rgba(201,168,76,0.1)",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: 6,
        padding: "4px 12px",
      }}>
        ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </nav>
  );
}
