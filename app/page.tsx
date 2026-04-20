"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminPanel from "@/components/AdminPanel";
import { loadBalance, saveBalance, STARTING_BALANCE } from "@/lib/balance";


interface GameCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  available: boolean;
  badge?: string;
  color: string;
}

const GAMES: GameCard[] = [
  { title: "Roulette", description: "European Single Zero. Place your bets and spin the wheel of fortune.", icon: "⊙", href: "/games/roulette", available: true, badge: "LIVE", color: "#c9a84c" },
  { title: "Blackjack", description: "Beat the dealer to 21 without busting. Classic card game.", icon: "♠", href: "/games/blackjack", available: true, badge: "NEW", color: "#60a5fa" },
  { title: "Slots", description: "Spin three reels and match symbols. How big can you win?", icon: "★", href: "/games/slots", available: true, badge: "NEW", color: "#f472b6" },
  { title: "Poker", description: "Video Poker - Jacks or Better. Hold your cards and draw to win.", icon: "♣", href: "/games/poker", available: true, badge: "NEW", color: "#a78bfa" },
  { title: "Crash", description: "Watch the multiplier rise - cash out before it crashes!", icon: "↗", href: "/games/crash", available: true, badge: "NEW", color: "#fb923c" },
  { title: "Cases", description: "Open CS2-style cases and unbox rare items. Consumer to Covert!", icon: "📦", href: "/games/cases", available: true, badge: "NEW", color: "#a78bfa" },
];

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [lobbyBalance, setLobbyBalance] = useState(STARTING_BALANCE);

  useEffect(() => {
    window.admin = () => {
      setLobbyBalance(loadBalance());
      setShowAdmin(true);
    };
    return () => { window.admin = undefined; };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #060a14 0%, #0a1628 40%, #0d1f3c 70%, #060a14 100%)",
      fontFamily: "Georgia, serif",
      overflowX: "hidden",
    }}>

      {/* â”€â”€ TOP NAV â”€â”€ */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        background: "rgba(4,7,16,0.96)",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 60,
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: "bold",
          letterSpacing: 4,
          textTransform: "uppercase",
          background: "linear-gradient(90deg, #8b6914, #f0d878, #c9a84c, #f0d878, #8b6914)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 3s linear infinite",
        }}>
          Royal Casino
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(201,168,76,0.5)", letterSpacing: 2 }}>GAMES</span>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 8px #22c55e",
            animation: "lobbyPulse 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 11, color: "#22c55e", letterSpacing: 1 }}>LIVE</span>
        </div>
      </nav>

      {/* â”€â”€ HERO â”€â”€ */}
      <div style={{
        position: "relative",
        textAlign: "center",
        padding: "80px 20px 60px",
        overflow: "hidden",
      }}>
        {/* Decorative rings */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400, height: 400,
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.09)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-block",
          fontSize: 11,
          letterSpacing: 6,
          color: "rgba(201,168,76,0.7)",
          textTransform: "uppercase",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 20,
          padding: "5px 18px",
          marginBottom: 24,
        }}>
          Premium Online Casino
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 80px)",
          fontWeight: "bold",
          margin: "0 0 12px",
          letterSpacing: 8,
          textTransform: "uppercase",
          background: "linear-gradient(90deg, #8b6914, #f0d878, #c9a84c, #f0d878, #8b6914)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 3s linear infinite",
          lineHeight: 1.1,
        }}>
          Royal Casino
        </h1>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", maxWidth: 400, margin: "0 auto 20px" }} />

        <p style={{
          fontSize: 15,
          color: "rgba(240,230,200,0.5)",
          letterSpacing: 3,
          textTransform: "uppercase",
          margin: 0,
        }}>
          Where Fortune Favours the Bold
        </p>
      </div>

      {/* â”€â”€ STATS BAR â”€â”€ */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 0,
        maxWidth: 700,
        margin: "0 auto 60px",
        border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(0,0,0,0.35)",
      }}>
        {[
          { label: "Games Available", value: "1" },
          { label: "Starting Balance", value: "$1,000" },
          { label: "Max Payout", value: "35Ã—" },
          { label: "House Edge", value: "2.7%" },
        ].map(({ label, value }, i) => (
          <div key={label} style={{
            flex: 1,
            padding: "16px 12px",
            textAlign: "center",
            borderRight: i < 3 ? "1px solid rgba(201,168,76,0.1)" : "none",
          }}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#f0d878", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 9, color: "rgba(201,168,76,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* â”€â”€ GAMES GRID â”€â”€ */}
      <div style={{ padding: "0 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 11,
            letterSpacing: 5,
            color: "rgba(201,168,76,0.6)",
            textTransform: "uppercase",
            margin: "0 0 6px",
          }}>
            Casino Games
          </h2>
          <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,168,76,0.4), transparent)", marginBottom: 0 }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}>
          {GAMES.map((game) => (
            <GameCardEl key={game.title} game={game} />
          ))}
        </div>
      </div>

      {/* â”€â”€ FOOTER â”€â”€ */}
      <footer style={{
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "24px 32px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 16,
          fontWeight: "bold",
          letterSpacing: 4,
          background: "linear-gradient(90deg, #8b6914, #c9a84c, #8b6914)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 8,
        }}>
          Royal Casino
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase" }}>
          For entertainment purposes only Â· No real money involved Â· Play responsibly
        </div>
      </footer>
      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        title="Lobby"
        balance={lobbyBalance}
        onSetBalance={(n) => { saveBalance(n); setLobbyBalance(n); }}
      />    </div>
  );
}

function GameCardEl({ game }: { game: GameCard }) {
  const content = (
    <div style={{
      position: "relative",
      background: "rgba(0,0,0,0.5)",
      border: `1px solid ${game.available ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16,
      padding: "28px 24px",
      cursor: game.available ? "pointer" : "default",
      transition: "all 0.25s ease",
      overflow: "hidden",
      height: "100%",
    }}
    onMouseEnter={(e) => {
      if (!game.available) return;
      (e.currentTarget as HTMLDivElement).style.border = `1px solid rgba(201,168,76,0.7)`;
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${game.color}22`;
    }}
    onMouseLeave={(e) => {
      if (!game.available) return;
      (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(201,168,76,0.35)";
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
    }}
    >
      {/* Glow blob */}
      {game.available && (
        <div style={{
          position: "absolute",
          top: -40, right: -40,
          width: 120, height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${game.color}18, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Badge */}
      <div style={{
        position: "absolute",
        top: 16, right: 16,
        fontSize: 9,
        letterSpacing: 1.5,
        fontWeight: "bold",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 10,
        background: game.available ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${game.available ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: game.available ? "#f0d878" : "rgba(255,255,255,0.3)",
      }}>
        {game.badge}
      </div>

      {/* Icon */}
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: game.available ? `${game.color}18` : "rgba(255,255,255,0.04)",
        border: `2px solid ${game.available ? game.color + "44" : "rgba(255,255,255,0.08)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, color: game.available ? game.color : "rgba(255,255,255,0.2)",
        marginBottom: 16, flexShrink: 0,
      }}>
        {game.icon}
      </div>

      {/* Title */}
      <h3 style={{
        margin: "0 0 8px",
        fontSize: 22,
        fontWeight: "bold",
        letterSpacing: 2,
        textTransform: "uppercase",
        color: game.available ? "#f0e6c8" : "rgba(255,255,255,0.25)",
      }}>
        {game.title}
      </h3>

      {/* Description */}
      <p style={{
        margin: "0 0 20px",
        fontSize: 13,
        color: game.available ? "rgba(240,230,200,0.55)" : "rgba(255,255,255,0.2)",
        lineHeight: 1.6,
      }}>
        {game.description}
      </p>

      {/* CTA */}
      {game.available ? (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "linear-gradient(135deg, #c9a84c, #f0d878, #c9a84c)",
          borderRadius: 8,
          padding: "10px 22px",
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#1a1000",
        }}>
          Play Now <span style={{ fontSize: 14 }}>›</span>
        </div>
      ) : (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "10px 22px",
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}>
          Coming Soon
        </div>
      )}
    </div>
  );

  if (game.available) {
    return (
      <Link href={game.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
        {content}
      </Link>
    );
  }
  return <div style={{ display: "flex", flexDirection: "column" }}>{content}</div>;
}
