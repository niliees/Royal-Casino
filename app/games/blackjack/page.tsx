"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import GameNav from "@/components/GameNav";
import AdminPanel from "@/components/AdminPanel";
import { loadBalance, saveBalance } from "@/lib/balance";

// ── Types ──────────────────────────────────────────────────────────────────
type Suit = "S" | "H" | "D" | "C";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
}

type Phase = "bet" | "playing" | "result";

function suitSymbol(s: Suit) {
  return { S: "\u2660", H: "\u2665", D: "\u2666", C: "\u2663" }[s];
}
function isRed(s: Suit) { return s === "H" || s === "D"; }

function cardValue(rank: Rank): number {
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return parseInt(rank);
}

function handTotal(hand: Card[]): number {
  let total = hand.filter(c => !c.faceDown).reduce((s, c) => s + cardValue(c.rank), 0);
  let aces = hand.filter(c => !c.faceDown && c.rank === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isSoft(hand: Card[]): boolean {
  const visible = hand.filter(c => !c.faceDown);
  const total = handTotal(visible);
  return visible.some(c => c.rank === "A") && total <= 21 &&
    visible.reduce((s, c) => {
      const rv = cardValue(c.rank);
      return s + rv;
    }, 0) !== total;
}

function buildDeck(): Card[] {
  const suits: Suit[] = ["S", "H", "D", "C"];
  const ranks: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck: Card[] = [];
  for (let d = 0; d < 6; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }
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

// ── Card Component ─────────────────────────────────────────────────────────
function CardUI({ card, small = false }: { card: Card; small?: boolean }) {
  if (card.faceDown) {
    return (
      <div style={{
        width: small ? 52 : 72, height: small ? 76 : 104,
        borderRadius: 8,
        background: "linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)",
        border: "2px solid rgba(201,168,76,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: small ? 20 : 28, color: "rgba(201,168,76,0.4)",
        flexShrink: 0,
      }}>?</div>
    );
  }
  const color = isRed(card.suit) ? "#e53e3e" : "#f0e6c8";
  return (
    <div style={{
      width: small ? 52 : 72, height: small ? 76 : 104,
      borderRadius: 8, background: "#f8f4e8",
      border: "2px solid #d4c070",
      display: "flex", flexDirection: "column",
      padding: "4px 6px", boxSizing: "border-box",
      color, flexShrink: 0, position: "relative",
      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
    }}>
      <span style={{ fontSize: small ? 13 : 16, fontWeight: "bold", lineHeight: 1 }}>{card.rank}</span>
      <span style={{ fontSize: small ? 13 : 16, lineHeight: 1 }}>{suitSymbol(card.suit)}</span>
      <span style={{
        position: "absolute", bottom: 4, right: 6,
        fontSize: small ? 13 : 16, transform: "rotate(180deg)",
        lineHeight: 1, fontWeight: "bold",
      }}>{card.rank}</span>
      <span style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: small ? 22 : 32,
      }}>{suitSymbol(card.suit)}</span>
    </div>
  );
}

// ── Chip Button ────────────────────────────────────────────────────────────
const CHIPS = [1, 5, 10, 25, 50, 100, 200, 500, 1000];

// ── Main Component ─────────────────────────────────────────────────────────
export default function BlackjackPage() {
  const [balance, setBalance] = useState(() => loadBalance());
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState(0);
  const [phase, setPhase] = useState<Phase>("bet");
  const [message, setMessage] = useState("");
  const [lastWin, setLastWin] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [infiniteBalance, setInfiniteBalance] = useState(false);
  const infiniteBalRef = useRef(false);

  useEffect(() => {
    window.admin = () => setShowAdmin(true);
    return () => { window.admin = undefined; };
  }, []);

  function addChip(value: number) {
    if (phase !== "bet") return;
    if (bet + value > balance) return;
    setBet(b => b + value);
  }

  function clearBet() {
    if (phase !== "bet") return;
    setBet(0);
  }

  const drawCard = useCallback((d: Card[], faceDown = false): [Card, Card[]] => {
    const newDeck = d.length < 15 ? buildDeck() : [...d];
    const card = { ...newDeck[0], faceDown };
    return [card, newDeck.slice(1)];
  }, []);

  function deal() {
    if (bet < 1) return;
    let d = [...deck];
    const [pc1, d1] = drawCard(d); d = d1;
    const [dc1, d2] = drawCard(d); d = d2;
    const [pc2, d3] = drawCard(d); d = d3;
    const [dc2, d4] = drawCard(d, true); d = d4;
    const p: Card[] = [pc1, pc2];
    const dlr: Card[] = [dc1, dc2];

    setDeck(d);
    setPlayerHand(p);
    setDealerHand(dlr);
    setPhase("playing");
    setMessage("");
    setLastWin(0);

    // Check player blackjack
    if (handTotal(p) === 21) {
      // Reveal dealer card and check if dealer also has blackjack
      const fullDealer = dlr.map(c => ({ ...c, faceDown: false }));
      const dealerTotal = handTotal(fullDealer);
      setDealerHand(fullDealer);
      if (dealerTotal === 21) {
        setMessage("Push — both Blackjack!");
        const newBal = balance; // return bet
        setBalance(newBal);
        saveBalance(newBal);
        setPhase("result");
      } else {
        const payout = Math.floor(bet * 2.5);
        setMessage(`Blackjack! You win $${payout - bet}!`);
        setLastWin(payout - bet);
        const newBal = balance - bet + payout;
        setBalance(newBal);
        saveBalance(newBal);
        setPhase("result");
      }
    }
  }

  function hit() {
    if (phase !== "playing") return;
    const [card, d] = drawCard([...deck]);
    const newHand = [...playerHand, card];
    setDeck(d);
    setPlayerHand(newHand);
    const total = handTotal(newHand);
    if (total > 21) {
      const fullDealer = dealerHand.map(c => ({ ...c, faceDown: false }));
      setDealerHand(fullDealer);
      setMessage(`Bust! You lose $${bet}.`);
      const rawBal = balance - bet;
      const newBal = infiniteBalRef.current ? Math.max(rawBal, balance) : rawBal;
      setBalance(newBal);
      saveBalance(newBal);
      setPhase("result");
    } else if (total === 21) {
      stand(newHand, d);
    }
  }

  function doubleDown() {
    if (phase !== "playing" || playerHand.length !== 2) return;
    if (bet > balance - bet) return; // can't afford
    const [card, d] = drawCard([...deck]);
    const newHand = [...playerHand, card];
    const newBet = bet * 2;
    setBet(newBet);
    setDeck(d);
    setPlayerHand(newHand);
    const total = handTotal(newHand);
    if (total > 21) {
      const fullDealer = dealerHand.map(c => ({ ...c, faceDown: false }));
      setDealerHand(fullDealer);
      setMessage(`Bust! You lose $${newBet}.`);
      const rawBal = balance - newBet;
      const newBal = infiniteBalRef.current ? Math.max(rawBal, balance) : rawBal;
      setBalance(newBal);
      saveBalance(newBal);
      setPhase("result");
    } else {
      stand(newHand, d, newBet);
    }
  }

  function stand(finalPlayerHand?: Card[], finalDeck?: Card[], finalBet?: number) {
    if (phase !== "playing" && !finalPlayerHand) return;
    const ph = finalPlayerHand ?? playerHand;
    let d = finalDeck ?? [...deck];
    const activeBet = finalBet ?? bet;

    // Reveal dealer hole card
    let dlr = dealerHand.map(c => ({ ...c, faceDown: false }));
    let card: Card;

    // Dealer draws to 17+ (stands on soft 17)
    while (handTotal(dlr) < 17 || (handTotal(dlr) === 17 && isSoft(dlr))) {
      [card, d] = drawCard(d);
      dlr = [...dlr, { ...card, faceDown: false }];
    }

    setDeck(d);
    setDealerHand(dlr);
    setPhase("result");

    const playerTotal = handTotal(ph);
    const dealerTotal = handTotal(dlr);

    let msg = "";
    let newBal = balance;
    let winAmt = 0;

    if (dealerTotal > 21) {
      msg = `Dealer busts! You win $${activeBet}!`;
      winAmt = activeBet;
      newBal = balance + activeBet;
    } else if (playerTotal > dealerTotal) {
      msg = `You win $${activeBet}!`;
      winAmt = activeBet;
      newBal = balance + activeBet;
    } else if (playerTotal === dealerTotal) {
      msg = "Push — bet returned.";
      newBal = balance; // no change if we track as deducted
    } else {
      msg = `Dealer wins. You lose $${activeBet}.`;
      newBal = balance - activeBet;
    }

    setMessage(msg);
    setLastWin(winAmt);
    // For push, bet is refunded; for win, net positive; for loss, already deducted
    if (playerTotal > dealerTotal || dealerTotal > 21) {
      newBal = balance + activeBet;
    } else if (playerTotal === dealerTotal) {
      newBal = balance; // push, no change
    } else {
      newBal = infiniteBalRef.current ? balance : balance - activeBet;
    }
    setBalance(newBal);
    saveBalance(newBal);
  }

  function newRound() {
    setBet(0);
    setPlayerHand([]);
    setDealerHand([]);
    setMessage("");
    setLastWin(0);
    setPhase("bet");
  }

  const playerTotal = playerHand.length > 0 ? handTotal(playerHand) : 0;
  const dealerVisible = dealerHand.filter(c => !c.faceDown);
  const dealerTotal = dealerVisible.length > 0 ? handTotal(dealerVisible) : 0;
  const canDouble = phase === "playing" && playerHand.length === 2 && bet <= balance - bet;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0d2137 0%, #0a0814 60%)",
      color: "#f0e6c8",
      fontFamily: "Georgia, serif",
    }}>
      <GameNav balance={balance} title="Blackjack" />

      <div style={{ paddingTop: 80, maxWidth: 800, margin: "0 auto", padding: "80px 16px 40px" }}>

        {/* Dealer */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: 2, color: "rgba(240,230,200,0.5)", marginBottom: 10 }}>
            DEALER {dealerHand.length > 0 && phase !== "playing" ? `— ${dealerTotal}` : dealerHand.length > 0 ? `— ${dealerTotal}` : ""}
          </p>
          <div style={{ display: "flex", gap: 10, minHeight: 108, flexWrap: "wrap" }}>
            {dealerHand.map((c, i) => <CardUI key={i} card={c} />)}
          </div>
        </section>

        {/* Divider */}
        <div style={{
          height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
          margin: "0 0 32px",
        }} />

        {/* Player */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: 2, color: "rgba(240,230,200,0.5)", marginBottom: 10 }}>
            YOU {playerTotal > 0 ? `— ${playerTotal}` : ""}
          </p>
          <div style={{ display: "flex", gap: 10, minHeight: 108, flexWrap: "wrap" }}>
            {playerHand.map((c, i) => <CardUI key={i} card={c} />)}
          </div>
        </section>

        {/* Message */}
        {message && (
          <div style={{
            background: lastWin > 0 ? "rgba(34,197,94,0.15)" : message.includes("Push") ? "rgba(201,168,76,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${lastWin > 0 ? "rgba(34,197,94,0.4)" : message.includes("Push") ? "rgba(201,168,76,0.4)" : "rgba(239,68,68,0.4)"}`,
            borderRadius: 10, padding: "16px 24px", marginBottom: 24, textAlign: "center",
            fontSize: 20, fontWeight: "bold",
            color: lastWin > 0 ? "#4ade80" : message.includes("Push") ? "#c9a84c" : "#f87171",
          }}>
            {message}
          </div>
        )}

        {/* Bet display */}
        {phase === "bet" && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16,
            }}>
              {CHIPS.map(v => (
                <button
                  key={v}
                  onClick={() => addChip(v)}
                  disabled={bet + v > balance}
                  style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: bet + v > balance ? "rgba(255,255,255,0.05)" : "rgba(201,168,76,0.15)",
                    border: `2px solid ${bet + v > balance ? "rgba(255,255,255,0.1)" : "rgba(201,168,76,0.6)"}`,
                    color: bet + v > balance ? "rgba(255,255,255,0.2)" : "#c9a84c",
                    fontFamily: "monospace", fontSize: 13, fontWeight: "bold",
                    cursor: bet + v > balance ? "not-allowed" : "pointer",
                  }}
                >
                  ${v}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{
                fontFamily: "monospace", fontSize: 18, color: "#c9a84c",
                background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 8, padding: "10px 20px",
              }}>
                Bet: ${bet}
              </div>
              <button
                onClick={clearBet}
                style={{
                  padding: "10px 20px", borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(240,230,200,0.6)", fontFamily: "monospace", fontSize: 14, cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                onClick={deal}
                disabled={bet < 1}
                style={{
                  padding: "10px 28px", borderRadius: 8, fontSize: 16, fontWeight: "bold",
                  background: bet >= 1 ? "linear-gradient(135deg, #c9a84c, #8b6914)" : "rgba(255,255,255,0.05)",
                  border: "none", color: bet >= 1 ? "#0a0814" : "rgba(255,255,255,0.2)",
                  fontFamily: "monospace", letterSpacing: 1, cursor: bet >= 1 ? "pointer" : "not-allowed",
                }}
              >
                DEAL
              </button>
            </div>
          </div>
        )}

        {/* Playing actions */}
        {phase === "playing" && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["HIT", "STAND", ...(canDouble ? ["DOUBLE"] : [])] as string[]).map(label => (
              <button
                key={label}
                onClick={label === "HIT" ? () => hit() : label === "STAND" ? () => stand() : () => doubleDown()}
                style={{
                  padding: "12px 28px", borderRadius: 8, fontSize: 15, fontWeight: "bold",
                  background: "linear-gradient(135deg, #c9a84c, #8b6914)",
                  border: "none", color: "#0a0814",
                  fontFamily: "monospace", letterSpacing: 1, cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Result actions */}
        {phase === "result" && (
          <button
            onClick={newRound}
            style={{
              padding: "12px 36px", borderRadius: 8, fontSize: 16, fontWeight: "bold",
              background: "linear-gradient(135deg, #c9a84c, #8b6914)",
              border: "none", color: "#0a0814",
              fontFamily: "monospace", letterSpacing: 2, cursor: "pointer",
            }}
          >
            NEW ROUND
          </button>
        )}

        {/* Rules */}
        <div style={{
          marginTop: 48, padding: "16px 20px",
          background: "rgba(255,255,255,0.03)", borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.07)",
          fontFamily: "monospace", fontSize: 12, color: "rgba(240,230,200,0.4)",
          lineHeight: 1.9,
        }}>
          <strong style={{ color: "rgba(240,230,200,0.6)" }}>RULES</strong><br />
          6-deck shoe &bull; Dealer stands on soft 17 &bull; Blackjack pays 3:2 &bull; Double on any 2 cards
        </div>
      </div>

      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        title="Blackjack"
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
