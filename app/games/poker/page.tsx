"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import GameNav from "@/components/GameNav";
import AdminPanel from "@/components/AdminPanel";
import { loadBalance, saveBalance } from "@/lib/balance";

// ── Types ──────────────────────────────────────────────────────────────────
type Suit = "S" | "H" | "D" | "C";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card { suit: Suit; rank: Rank }
type Phase = "bet" | "deal" | "draw" | "result";

function suitSymbol(s: Suit) {
  return { S: "\u2660", H: "\u2665", D: "\u2666", C: "\u2663" }[s];
}
function isRed(s: Suit) { return s === "H" || s === "D"; }

function cardRankValue(r: Rank): number {
  const map: Record<Rank, number> = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
    "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
  };
  return map[r];
}

function buildDeck(): Card[] {
  const suits: Suit[] = ["S", "H", "D", "C"];
  const ranks: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck: Card[] = [];
  for (const suit of suits)
    for (const rank of ranks)
      deck.push({ suit, rank });
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Hand Evaluator ─────────────────────────────────────────────────────────
interface HandResult {
  name: string;
  multiplier: number;
}

function evaluateHand(hand: Card[]): HandResult {
  const ranks = hand.map(c => cardRankValue(c.rank));
  const suits = hand.map(c => c.suit);
  ranks.sort((a, b) => a - b);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = ranks[4] - ranks[0] === 4 && new Set(ranks).size === 5;
  const isRoyalStraight = JSON.stringify(ranks) === JSON.stringify([10, 11, 12, 13, 14]);

  const freq: Record<number, number> = {};
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);

  if (isFlush && isRoyalStraight) return { name: "Royal Flush", multiplier: 800 };
  if (isFlush && isStraight)      return { name: "Straight Flush", multiplier: 50 };
  if (counts[0] === 4)            return { name: "Four of a Kind", multiplier: 25 };
  if (counts[0] === 3 && counts[1] === 2) return { name: "Full House", multiplier: 9 };
  if (isFlush)                    return { name: "Flush", multiplier: 6 };
  if (isStraight)                 return { name: "Straight", multiplier: 4 };
  if (counts[0] === 3)            return { name: "Three of a Kind", multiplier: 3 };
  if (counts[0] === 2 && counts[1] === 2) return { name: "Two Pair", multiplier: 2 };

  // Jacks or Better: pair of J, Q, K, or A
  if (counts[0] === 2) {
    const pairedRank = parseInt(Object.entries(freq).find(([, v]) => v === 2)![0]);
    if (pairedRank >= 11) return { name: "Jacks or Better", multiplier: 1 };
  }

  return { name: "No Win", multiplier: 0 };
}

// ── Card Component ─────────────────────────────────────────────────────────
function CardUI({ card, held, onToggle, phase }: {
  card: Card; held: boolean; onToggle?: () => void; phase: Phase;
}) {
  const canHold = phase === "deal";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        onClick={canHold ? onToggle : undefined}
        style={{
          width: 76, height: 110,
          borderRadius: 8, background: "#f8f4e8",
          border: `3px solid ${held ? "#4ade80" : "#d4c070"}`,
          display: "flex", flexDirection: "column",
          padding: "5px 7px", boxSizing: "border-box",
          color: isRed(card.suit) ? "#e53e3e" : "#1a1a2e",
          flexShrink: 0, position: "relative",
          boxShadow: held ? "0 0 16px rgba(74,222,128,0.5)" : "0 4px 12px rgba(0,0,0,0.5)",
          cursor: canHold ? "pointer" : "default",
          transition: "border-color 0.15s, box-shadow 0.15s",
          transform: held ? "translateY(-6px)" : "none",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: "bold", lineHeight: 1 }}>{card.rank}</span>
        <span style={{ fontSize: 15, lineHeight: 1 }}>{suitSymbol(card.suit)}</span>
        <span style={{
          position: "absolute", bottom: 5, right: 7,
          fontSize: 15, transform: "rotate(180deg)", lineHeight: 1, fontWeight: "bold",
        }}>{card.rank}</span>
        <span style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", fontSize: 34,
        }}>{suitSymbol(card.suit)}</span>
      </div>
      <span style={{
        fontFamily: "monospace", fontSize: 11, letterSpacing: 1,
        color: held ? "#4ade80" : "transparent",
        fontWeight: "bold",
      }}>HELD</span>
    </div>
  );
}

// ── Pay Table ──────────────────────────────────────────────────────────────
const PAY_TABLE = [
  { name: "Royal Flush",   mult: 800 },
  { name: "Straight Flush", mult: 50  },
  { name: "Four of a Kind", mult: 25  },
  { name: "Full House",     mult: 9   },
  { name: "Flush",          mult: 6   },
  { name: "Straight",       mult: 4   },
  { name: "Three of a Kind", mult: 3  },
  { name: "Two Pair",       mult: 2   },
  { name: "Jacks or Better", mult: 1  },
];

const CHIPS = [1, 5, 10, 25, 50, 100, 200, 500, 1000];

// ── Main Component ─────────────────────────────────────────────────────────
export default function PokerPage() {
  const [balance, setBalance] = useState(() => loadBalance());
  const [bet, setBet] = useState(0);
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [phase, setPhase] = useState<Phase>("bet");
  const [result, setResult] = useState<HandResult | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [infiniteBalance, setInfiniteBalance] = useState(false);
  const infiniteBalRef = useRef(false);

  useEffect(() => {
    window.admin = () => setShowAdmin(true);
    return () => { window.admin = undefined; };
  }, []);

  function addChip(v: number) {
    if (phase !== "bet") return;
    if (bet + v > balance) return;
    setBet(b => b + v);
  }

  function dealHand() {
    if (bet < 1) return;
    const d = deck.length < 10 ? buildDeck() : [...deck];
    const newHand = d.slice(0, 5);
    setDeck(d.slice(5));
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setResult(null);
    setPhase("deal");
  }

  function toggleHold(i: number) {
    if (phase !== "deal") return;
    setHeld(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }

  const draw = useCallback(() => {
    if (phase !== "deal") return;
    let d = [...deck];
    if (d.length < 5) d = buildDeck();

    const newHand = hand.map((c, i) => {
      if (held[i]) return c;
      const drawn = d[0];
      d = d.slice(1);
      return drawn;
    });

    setDeck(d);
    setHand(newHand);
    setPhase("draw");

    const res = evaluateHand(newHand);
    setResult(res);

    const payout = bet * res.multiplier;
    const rawBal = res.multiplier > 0
      ? balance - bet + payout
      : balance - bet;
    const newBal = infiniteBalRef.current ? Math.max(rawBal, balance) : rawBal;
    setBalance(newBal);
    saveBalance(newBal);

    setTimeout(() => setPhase("result"), 300);
  }, [phase, deck, hand, held, bet, balance]);

  function newRound() {
    setBet(0);
    setHand([]);
    setHeld([false, false, false, false, false]);
    setResult(null);
    setPhase("bet");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0d2e1a 0%, #0a0814 60%)",
      color: "#f0e6c8",
      fontFamily: "Georgia, serif",
    }}>
      <GameNav balance={balance} title="Video Poker" />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 16px 40px" }}>

        <h1 style={{
          textAlign: "center", fontSize: 26, letterSpacing: 4,
          color: "#c9a84c", textTransform: "uppercase", marginBottom: 4,
        }}>Jacks or Better</h1>
        <p style={{ textAlign: "center", fontFamily: "monospace", fontSize: 11, color: "rgba(240,230,200,0.4)", marginBottom: 32, letterSpacing: 2 }}>
          {phase === "deal" ? "CLICK CARDS TO HOLD — THEN DRAW" : phase === "bet" ? "PLACE YOUR BET AND DEAL" : "\u00a0"}
        </p>

        {/* Hand */}
        {hand.length === 5 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
            {hand.map((c, i) => (
              <CardUI key={i} card={c} held={held[i]} onToggle={() => toggleHold(i)} phase={phase} />
            ))}
          </div>
        )}

        {/* Result banner */}
        {result && phase === "result" && (
          <div style={{
            textAlign: "center", marginBottom: 24,
            background: result.multiplier > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${result.multiplier > 0 ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 10, padding: "16px 24px",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: "bold", color: result.multiplier > 0 ? "#4ade80" : "#f87171" }}>
              {result.name}
            </p>
            {result.multiplier > 0 && (
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 15, color: "#4ade80" }}>
                +${bet * result.multiplier - bet} (${result.multiplier}× bet)
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          {phase === "bet" && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {CHIPS.map(v => (
                  <button key={v} onClick={() => addChip(v)} disabled={bet + v > balance}
                    style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: bet + v > balance ? "rgba(255,255,255,0.04)" : "rgba(201,168,76,0.15)",
                      border: `2px solid ${bet + v > balance ? "rgba(255,255,255,0.1)" : "rgba(201,168,76,0.5)"}`,
                      color: bet + v > balance ? "rgba(255,255,255,0.15)" : "#c9a84c",
                      fontFamily: "monospace", fontSize: 12, fontWeight: "bold",
                      cursor: bet + v > balance ? "not-allowed" : "pointer",
                    }}>
                    ${v}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{
                  fontFamily: "monospace", fontSize: 17, color: "#c9a84c",
                  background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 8, padding: "8px 18px",
                }}>Bet: ${bet}</span>
                <button onClick={() => setBet(0)} style={{
                  padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,230,200,0.5)",
                  fontFamily: "monospace", fontSize: 13, cursor: "pointer",
                }}>Clear</button>
                <button onClick={dealHand} disabled={bet < 1}
                  style={{
                    padding: "10px 28px", borderRadius: 8, fontSize: 16, fontWeight: "bold",
                    background: bet >= 1 ? "linear-gradient(135deg, #c9a84c, #8b6914)" : "rgba(255,255,255,0.05)",
                    border: "none", color: bet >= 1 ? "#0a0814" : "rgba(255,255,255,0.2)",
                    fontFamily: "monospace", letterSpacing: 1, cursor: bet >= 1 ? "pointer" : "not-allowed",
                  }}>DEAL</button>
              </div>
            </>
          )}

          {phase === "deal" && (
            <button onClick={draw} style={{
              padding: "12px 36px", borderRadius: 8, fontSize: 16, fontWeight: "bold",
              background: "linear-gradient(135deg, #c9a84c, #8b6914)",
              border: "none", color: "#0a0814",
              fontFamily: "monospace", letterSpacing: 2, cursor: "pointer",
            }}>DRAW</button>
          )}

          {phase === "result" && (
            <button onClick={newRound} style={{
              padding: "12px 36px", borderRadius: 8, fontSize: 16, fontWeight: "bold",
              background: "linear-gradient(135deg, #c9a84c, #8b6914)",
              border: "none", color: "#0a0814",
              fontFamily: "monospace", letterSpacing: 2, cursor: "pointer",
            }}>NEW ROUND</button>
          )}
        </div>

        {/* Pay Table */}
        <div style={{
          marginTop: 40, padding: "16px 20px",
          background: "rgba(255,255,255,0.03)", borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: 2, color: "rgba(240,230,200,0.5)", margin: "0 0 12px" }}>PAY TABLE</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
            {PAY_TABLE.map(row => (
              <div key={row.name} style={{
                display: "flex", justifyContent: "space-between",
                fontFamily: "monospace", fontSize: 12,
                padding: "3px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: result?.name === row.name ? "rgba(201,168,76,0.08)" : "transparent",
              }}>
                <span style={{ color: result?.name === row.name ? "#c9a84c" : "rgba(240,230,200,0.6)" }}>{row.name}</span>
                <span style={{ color: result?.name === row.name ? "#c9a84c" : "rgba(240,230,200,0.4)" }}>{row.mult}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        title="Video Poker"
        balance={balance}
        onSetBalance={(n) => { setBalance(n); saveBalance(n); }}
      >
        <div>
          <div style={{ color: "rgba(240,230,200,0.4)", letterSpacing: 1, marginBottom: 8, fontSize: 10, textTransform: "uppercase" }}>Game Settings</div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={infiniteBalance}
              onChange={() => {
                const next = !infiniteBalRef.current;
                infiniteBalRef.current = next;
                setInfiniteBalance(next);
              }}
              style={{ width: 14, height: 14, cursor: "pointer" }}
            />
            <span style={{ color: "#f0e6c8", fontSize: 12 }}>Infinite Balance (can&apos;t lose)</span>
          </label>
        </div>
      </AdminPanel>
    </div>
  );
}
