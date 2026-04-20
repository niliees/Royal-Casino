"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import GameNav from "@/components/GameNav";
import AdminPanel from "@/components/AdminPanel";
import { loadBalance, saveBalance } from "@/lib/balance";

// ── Item Definitions ───────────────────────────────────────────────────────
type Rarity = "consumer" | "industrial" | "milspec" | "restricted" | "classified" | "covert" | "gold";

interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  value: number;
  emoji: string;
}

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; weight: number }> = {
  consumer:   { label: "Consumer Grade",   color: "#b0b0b0", glow: "rgba(176,176,176,0.6)",  weight: 80 },
  industrial: { label: "Industrial Grade", color: "#6baee8", glow: "rgba(107,174,232,0.6)",  weight: 50 },
  milspec:    { label: "Mil-Spec",          color: "#4b69ff", glow: "rgba(75,105,255,0.7)",   weight: 25 },
  restricted: { label: "Restricted",       color: "#8847ff", glow: "rgba(136,71,255,0.7)",   weight: 10 },
  classified: { label: "Classified",       color: "#d32ce6", glow: "rgba(211,44,230,0.8)",   weight: 4  },
  covert:     { label: "Covert",           color: "#eb4b4b", glow: "rgba(235,75,75,0.9)",    weight: 1  },
  gold:       { label: "★ Rare Special",  color: "#e4ae39", glow: "rgba(228,174,57,1.0)",    weight: 0.26 },
};

// ── Case Definitions ──────────────────────────────────────────────────────
interface CaseDef {
  id: string;
  name: string;
  price: number;
  color: string;
  emoji: string;
  items: Item[];
}

const CASES: CaseDef[] = [
  {
    id: "royal",
    name: "Royal Case",
    price: 5,
    color: "#c9a84c",
    emoji: "👑",
    items: [
      { id: "rc1",  name: "Rusty Pistol",         rarity: "consumer",   value: 0.50,  emoji: "🔫" },
      { id: "rc2",  name: "Worn Knife",            rarity: "consumer",   value: 0.80,  emoji: "🔪" },
      { id: "rc3",  name: "Field Tested SMG",      rarity: "industrial", value: 2.00,  emoji: "🔫" },
      { id: "rc4",  name: "Blue Steel Rifle",      rarity: "industrial", value: 3.50,  emoji: "🎯" },
      { id: "rc5",  name: "Cobalt Disruption",     rarity: "milspec",    value: 8.00,  emoji: "💠" },
      { id: "rc6",  name: "Hyper Beast",           rarity: "milspec",    value: 12.00, emoji: "🐉" },
      { id: "rc7",  name: "Neon Revolution",       rarity: "restricted", value: 25.00, emoji: "⚡" },
      { id: "rc8",  name: "Fade Pistol",           rarity: "restricted", value: 40.00, emoji: "🌈" },
      { id: "rc9",  name: "Crimson Web",           rarity: "classified", value: 80.00, emoji: "🕷️" },
      { id: "rc10", name: "Dragon Lore",           rarity: "covert",     value: 200.00,emoji: "🔥" },
      { id: "rc11", name: "★ Karambit Fade",       rarity: "gold",       value: 500.00,emoji: "✨" },
    ],
  },
  {
    id: "diamond",
    name: "Diamond Case",
    price: 15,
    color: "#60a5fa",
    emoji: "💎",
    items: [
      { id: "dc1",  name: "Plain Glock",           rarity: "consumer",   value: 1.00,  emoji: "🔫" },
      { id: "dc2",  name: "Factory New USP",       rarity: "consumer",   value: 1.50,  emoji: "🔫" },
      { id: "dc3",  name: "Ice Cap",               rarity: "industrial", value: 5.00,  emoji: "❄️" },
      { id: "dc4",  name: "Sapphire Flow",         rarity: "industrial", value: 8.00,  emoji: "💙" },
      { id: "dc5",  name: "Blue Laminate",         rarity: "milspec",    value: 20.00, emoji: "🔵" },
      { id: "dc6",  name: "Vulcan Rifle",          rarity: "milspec",    value: 30.00, emoji: "⚙️" },
      { id: "dc7",  name: "Aquamarine Revenge",    rarity: "restricted", value: 65.00, emoji: "🌊" },
      { id: "dc8",  name: "Poseidon",              rarity: "restricted", value: 90.00, emoji: "🔱" },
      { id: "dc9",  name: "Howl",                  rarity: "classified", value: 200.00,emoji: "🐺" },
      { id: "dc10", name: "Ice Storm",             rarity: "covert",     value: 500.00,emoji: "🌨️" },
      { id: "dc11", name: "★ Butterfly Sapphire",  rarity: "gold",       value: 1500.00,emoji:"✨" },
    ],
  },
  {
    id: "inferno",
    name: "Inferno Case",
    price: 35,
    color: "#fb923c",
    emoji: "🔥",
    items: [
      { id: "ic1",  name: "Scorched M4",           rarity: "consumer",   value: 2.00,  emoji: "🔫" },
      { id: "ic2",  name: "Ashen Pistol",          rarity: "consumer",   value: 3.00,  emoji: "🔫" },
      { id: "ic3",  name: "Lava Flow AK",          rarity: "industrial", value: 12.00, emoji: "🌋" },
      { id: "ic4",  name: "Ember Recoil",          rarity: "industrial", value: 18.00, emoji: "💥" },
      { id: "ic5",  name: "Phoenix Blacklight",    rarity: "milspec",    value: 45.00, emoji: "🦅" },
      { id: "ic6",  name: "Blaze",                 rarity: "milspec",    value: 70.00, emoji: "🔥" },
      { id: "ic7",  name: "Hellfire",              rarity: "restricted", value: 150.00,emoji: "😈" },
      { id: "ic8",  name: "Crimson Kimono",        rarity: "restricted", value: 200.00,emoji: "🎌" },
      { id: "ic9",  name: "Fire Serpent",          rarity: "classified", value: 450.00,emoji: "🐍" },
      { id: "ic10", name: "Medusa",                rarity: "covert",     value: 1200.00,emoji:"🏛️" },
      { id: "ic11", name: "★ M9 Lore",             rarity: "gold",       value: 3500.00,emoji:"✨" },
    ],
  },
];

// ── Weighted random pick ───────────────────────────────────────────────────
function pickItem(items: Item[]): Item {
  const totalWeight = items.reduce((sum, item) => sum + RARITY_CONFIG[item.rarity].weight, 0);
  let rand = Math.random() * totalWeight;
  for (const item of items) {
    rand -= RARITY_CONFIG[item.rarity].weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

// Generate a long strip of items for the scroll animation
function generateStrip(caseItems: Item[], winner: Item, count = 60): Item[] {
  const strip: Item[] = [];
  for (let i = 0; i < count - 1; i++) {
    strip.push(pickItem(caseItems));
  }
  // Place the winner at position 47 (near end of strip, where we stop)
  strip.splice(47, 0, winner);
  return strip;
}

const ITEM_WIDTH = 130; // px
const ITEM_GAP = 8;
const WINNER_INDEX = 47;

// ── Component ─────────────────────────────────────────────────────────────
export default function CasesPage() {
  const [balance, setBalance] = useState(1000);
  const [selectedCase, setSelectedCase] = useState<CaseDef>(CASES[0]);
  const [opening, setOpening] = useState(false);
  const [stripItems, setStripItems] = useState<Item[]>([]);
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Admin state
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<"control" | "stats">("control");
  const [infiniteBalance, setInfiniteBalance] = useState(false);
  const [forceRarity, setForceRarity] = useState<Rarity | null>(null);
  const [autoOpen, setAutoOpen] = useState(false);
  const [caseStats, setCaseStats] = useState({ opened: 0, spent: 0, won: 0, byRarity: {} as Record<string, number> });

  // Refs — always have fresh values in callbacks/timeouts without stale closures
  const openingRef = useRef(false);
  const selectedCaseRef = useRef<CaseDef>(CASES[0]);
  const infiniteBalRef = useRef(false);
  const forceRarityRef = useRef<Rarity | null>(null);
  const autoOpenRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWinnerRef = useRef<Item | null>(null);

  // Sync selectedCase ref
  useEffect(() => { selectedCaseRef.current = selectedCase; }, [selectedCase]);

  // Load balance from localStorage (client-side only, avoids SSR mismatch)
  useEffect(() => {
    setBalance(loadBalance());
    window.admin = () => setShowAdmin(true);
    return () => { window.admin = undefined; };
  }, []);

  // ── Animation effect — fires AFTER React commits new stripItems to DOM ──
  useEffect(() => {
    if (!openingRef.current || stripItems.length === 0 || !stripRef.current) return;
    const el = stripRef.current;
    const containerWidth = containerRef.current?.offsetWidth ?? 700;
    // Instant reset (no transition)
    el.style.transition = "none";
    el.style.transform = "translateX(0px)";
    void el.offsetWidth; // force reflow
    // Next frame: fly to winner
    const raf = requestAnimationFrame(() => {
      const center = containerWidth / 2 - ITEM_WIDTH / 2;
      const target = -(WINNER_INDEX * (ITEM_WIDTH + ITEM_GAP)) + center;
      const jitter = (Math.random() - 0.5) * 80;
      el.style.transition = "transform 4.4s cubic-bezier(0.02, 0.8, 0.2, 1)";
      el.style.transform = `translateX(${target + jitter}px)`;
    });
    return () => cancelAnimationFrame(raf);
  }, [stripItems]); // intentionally only on stripItems change

  function showNotif(msg: string) {
    setNotification(msg);
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setNotification(null), 3000);
  }

  function handleOpenCase() {
    if (openingRef.current) return;

    const currentBalance = loadBalance();
    const activeCase = selectedCaseRef.current;

    if (!infiniteBalRef.current && currentBalance < activeCase.price) {
      showNotif("Nicht genug Guthaben!");
      return;
    }

    // Deduct cost
    const spent = infiniteBalRef.current ? 0 : activeCase.price;
    const newBalance = currentBalance - spent;
    setBalance(newBalance);
    saveBalance(newBalance);

    // Pick winner
    const forced = forceRarityRef.current;
    let winner: Item;
    if (forced) {
      const pool = activeCase.items.filter(i => i.rarity === forced);
      winner = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : pickItem(activeCase.items);
    } else {
      winner = pickItem(activeCase.items);
    }

    pendingWinnerRef.current = winner;

    // Track stats
    setCaseStats(s => ({
      opened: s.opened + 1,
      spent: s.spent + spent,
      won: s.won + winner.value,
      byRarity: { ...s.byRarity, [winner.rarity]: (s.byRarity[winner.rarity] ?? 0) + 1 },
    }));

    // Generate strip and kick off animation (via useEffect)
    const strip = generateStrip(activeCase.items, winner);
    openingRef.current = true;
    setOpening(true);
    setShowResult(false);
    setWonItem(null);
    setStripItems(strip);

    // Show result after animation
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      const w = pendingWinnerRef.current;
      if (!w) return;
      openingRef.current = false;
      setOpening(false);
      setWonItem(w);
      setShowResult(true);
      setInventory(prev => [w, ...prev]);
      // Auto-open
      if (autoOpenRef.current) {
        setTimeout(handleOpenCase, 900);
      }
    }, 4700);
  }

  function handleSellFromPopup() {
    if (!wonItem) return;
    const newBalance = loadBalance() + wonItem.value;
    setBalance(newBalance);
    saveBalance(newBalance);
    setInventory(prev => prev.filter((_, i) => i !== 0));
    setShowResult(false);
    showNotif(`+$${wonItem.value.toFixed(2)} — ${wonItem.name} verkauft!`);
  }

  function handleSellInventory(item: Item, index: number) {
    const newBalance = loadBalance() + item.value;
    setBalance(newBalance);
    saveBalance(newBalance);
    setInventory(prev => prev.filter((_, i) => i !== index));
    showNotif(`+$${item.value.toFixed(2)} — ${item.name} verkauft!`);
  }

  function handleSelectCase(c: CaseDef) {
    if (openingRef.current) return;
    selectedCaseRef.current = c;
    setSelectedCase(c);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #060a14 0%, #0a1628 40%, #0d1f3c 70%, #060a14 100%)",
      fontFamily: "Georgia, serif",
      color: "#f0e6c8",
    }}>
      <GameNav balance={balance} title="Cases" />

      <style>{`
        @keyframes caseShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes resultPop {
          0%   { transform: scale(0.5) translateY(20px); opacity: 0; }
          70%  { transform: scale(1.08) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rarityPulse {
          0%, 100% { box-shadow: 0 0 12px var(--glow); }
          50%       { box-shadow: 0 0 28px var(--glow); }
        }
      `}</style>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,8,20,0.95)", border: "1px solid #c9a84c",
          borderRadius: 8, padding: "10px 24px", color: "#c9a84c",
          fontSize: 14, fontFamily: "monospace", zIndex: 200,
          animation: "floatIn 0.3s ease", whiteSpace: "nowrap",
        }}>
          {notification}
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px 40px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontSize: 36, fontWeight: "bold", letterSpacing: 4,
            textTransform: "uppercase", margin: 0,
            background: "linear-gradient(90deg, #8b6914, #f0d878, #c9a84c, #f0d878, #8b6914)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "caseShimmer 3s linear infinite",
          }}>
            Case Opening
          </h1>
          <p style={{ color: "rgba(240,230,200,0.5)", fontSize: 14, marginTop: 8, letterSpacing: 1 }}>
            OPEN CASES · WIN RARE ITEMS
          </p>
        </div>

        {/* ── Case Selector ── */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {CASES.map(c => (
            <button key={c.id} onClick={() => handleSelectCase(c)}
              style={{
                background: selectedCase.id === c.id
                  ? `linear-gradient(135deg, rgba(${hexToRgb(c.color)},0.3), rgba(${hexToRgb(c.color)},0.1))`
                  : "rgba(255,255,255,0.04)",
                border: `2px solid ${selectedCase.id === c.id ? c.color : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12, padding: "16px 24px",
                cursor: opening ? "not-allowed" : "pointer",
                color: selectedCase.id === c.id ? c.color : "rgba(240,230,200,0.7)",
                transition: "all 0.2s", textAlign: "center", minWidth: 140,
                opacity: opening ? 0.6 : 1,
              }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>{c.emoji}</div>
              <div style={{ fontWeight: "bold", fontSize: 14, letterSpacing: 1 }}>{c.name}</div>
              <div style={{ fontSize: 18, fontWeight: "bold", marginTop: 4, color: c.color }}>${c.price}</div>
            </button>
          ))}
        </div>

        {/* ── Case Contents Preview ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: 16, padding: "20px 24px", marginBottom: 32,
        }}>
          <div style={{ fontSize: 12, color: "rgba(240,230,200,0.4)", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>
            Mögliche Items — {selectedCase.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[...selectedCase.items]
              .sort((a, b) => RARITY_CONFIG[a.rarity].weight - RARITY_CONFIG[b.rarity].weight)
              .map(item => {
                const cfg = RARITY_CONFIG[item.rarity];
                return (
                  <div key={item.id} style={{
                    background: `linear-gradient(135deg, rgba(${hexToRgb(cfg.color)},0.12), transparent)`,
                    border: `1px solid ${cfg.color}44`,
                    borderRadius: 8, padding: "8px 12px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, color: cfg.color, fontWeight: "bold" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(240,230,200,0.45)" }}>${item.value.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ── Spinner Track ── */}
        <div style={{
          position: "relative", marginBottom: 32,
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 16, overflow: "hidden",
          height: ITEM_WIDTH + 32,
        }}>
          {/* Center highlight border */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: "50%", transform: "translateX(-50%)",
            width: ITEM_WIDTH + 4, zIndex: 10, pointerEvents: "none",
            border: "2px solid #c9a84c", borderRadius: 8,
            boxShadow: "0 0 16px rgba(201,168,76,0.5)",
          }} />
          {/* Edge fades */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none",
            background: "linear-gradient(90deg, rgba(6,10,20,0.9) 0%, transparent 20%, transparent 80%, rgba(6,10,20,0.9) 100%)",
          }} />
          <div ref={containerRef} style={{ overflow: "hidden", height: "100%", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <div ref={stripRef} style={{ display: "flex", gap: ITEM_GAP, alignItems: "center", willChange: "transform" }}>
              {stripItems.length === 0 ? (
                <div style={{ width: (ITEM_WIDTH + ITEM_GAP) * 5, textAlign: "center", color: "rgba(240,230,200,0.2)", fontSize: 14 }}>
                  Drücke &quot;Case öffnen&quot; um zu starten
                </div>
              ) : stripItems.map((item, i) => {
                const cfg = RARITY_CONFIG[item.rarity];
                const isWinner = showResult && i === WINNER_INDEX;
                return (
                  <div key={i} style={{
                    width: ITEM_WIDTH, flexShrink: 0, height: ITEM_WIDTH,
                    background: isWinner
                      ? `linear-gradient(135deg, rgba(${hexToRgb(cfg.color)},0.5), rgba(${hexToRgb(cfg.color)},0.15))`
                      : `linear-gradient(135deg, rgba(${hexToRgb(cfg.color)},0.2), rgba(${hexToRgb(cfg.color)},0.05))`,
                    border: `2px solid ${cfg.color}${isWinner ? "ff" : "66"}`,
                    borderRadius: 10,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 6,
                    animation: isWinner ? "rarityPulse 1s ease-in-out infinite" : "none",
                    boxShadow: isWinner ? `0 0 24px ${cfg.glow}` : "none",
                  }}>
                    <span style={{ fontSize: 32 }}>{item.emoji}</span>
                    <div style={{ fontSize: 10, color: cfg.color, fontWeight: "bold", textAlign: "center", padding: "0 4px", lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,230,200,0.5)" }}>${item.value.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Result Popup ── */}
        {showResult && wonItem && (() => {
          const cfg = RARITY_CONFIG[wonItem.rarity];
          return (
            <div style={{
              background: `linear-gradient(135deg, rgba(${hexToRgb(cfg.color)},0.25), rgba(10,8,20,0.95))`,
              border: `2px solid ${cfg.color}`,
              borderRadius: 20, padding: "28px 32px", marginBottom: 32, textAlign: "center",
              boxShadow: `0 0 40px ${cfg.glow}`,
              animation: "resultPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <div style={{ fontSize: 14, letterSpacing: 2, color: "rgba(240,230,200,0.5)", marginBottom: 8, textTransform: "uppercase" }}>Du hast gewonnen</div>
              <div style={{ fontSize: 56 }}>{wonItem.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: cfg.color, margin: "8px 0 4px" }}>{wonItem.name}</div>
              <div style={{ fontSize: 13, color: cfg.color, opacity: 0.7, marginBottom: 12 }}>{cfg.label}</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#f0d878", marginBottom: 20 }}>${wonItem.value.toFixed(2)}</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handleSellFromPopup} style={{
                  background: "linear-gradient(135deg, #c9a84c, #8b6914)",
                  border: "none", borderRadius: 10, padding: "12px 32px",
                  color: "#0a0810", fontWeight: "bold", fontSize: 15, cursor: "pointer",
                  letterSpacing: 1, textTransform: "uppercase",
                }}>Verkaufen für ${wonItem.value.toFixed(2)}</button>
                <button onClick={() => setShowResult(false)} style={{
                  background: "transparent", border: "2px solid rgba(240,230,200,0.2)",
                  borderRadius: 10, padding: "12px 32px",
                  color: "rgba(240,230,200,0.6)", fontWeight: "bold", fontSize: 15, cursor: "pointer",
                  letterSpacing: 1, textTransform: "uppercase",
                }}>Behalten</button>
              </div>
            </div>
          );
        })()}

        {/* ── Open Button ── */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <button onClick={handleOpenCase} disabled={opening} style={{
            background: opening ? "rgba(201,168,76,0.2)" : "linear-gradient(135deg, #c9a84c, #8b6914)",
            border: opening ? "2px solid rgba(201,168,76,0.3)" : "2px solid #c9a84c",
            borderRadius: 14, padding: "16px 56px",
            cursor: opening ? "not-allowed" : "pointer",
            color: opening ? "rgba(240,230,200,0.4)" : "#0a0810",
            fontSize: 18, fontWeight: "bold", letterSpacing: 2,
            textTransform: "uppercase", transition: "all 0.2s",
            boxShadow: opening ? "none" : "0 0 24px rgba(201,168,76,0.4)",
          }}>
            {opening ? "Öffnet..." : `${selectedCase.emoji} Case öffnen — $${selectedCase.price}`}
          </button>
        </div>

        {/* ── Inventory ── */}
        {inventory.length > 0 && (
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "rgba(240,230,200,0.4)", textTransform: "uppercase", marginBottom: 16 }}>
              Inventar ({inventory.length} Items)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {inventory.map((item, idx) => {
                const cfg = RARITY_CONFIG[item.rarity];
                return (
                  <div key={idx} style={{
                    background: `linear-gradient(135deg, rgba(${hexToRgb(cfg.color)},0.15), rgba(${hexToRgb(cfg.color)},0.04))`,
                    border: `1px solid ${cfg.color}55`,
                    borderRadius: 12, padding: "14px 16px", width: 130,
                    textAlign: "center", animation: "floatIn 0.3s ease",
                  }}>
                    <div style={{ fontSize: 28 }}>{item.emoji}</div>
                    <div style={{ fontSize: 11, color: cfg.color, fontWeight: "bold", margin: "6px 0 2px", lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,230,200,0.4)", marginBottom: 10 }}>${item.value.toFixed(2)}</div>
                    <button onClick={() => handleSellInventory(item, idx)} style={{
                      background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
                      borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                      color: "#c9a84c", fontSize: 11, fontWeight: "bold", width: "100%",
                    }}>Sell ${item.value.toFixed(2)}</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        title="Cases"
        balance={balance}
        onSetBalance={(n) => { setBalance(n); saveBalance(n); }}
      >
        <div>
          <div style={{ display: "flex", marginBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {(["control", "stats"] as const).map(tab => (
              <button key={tab} onClick={() => setAdminTab(tab)} style={{
                flex: 1, padding: "5px 0", fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                background: "transparent", border: "none",
                borderBottom: `1px solid ${adminTab === tab ? "#c9a84c" : "transparent"}`,
                color: adminTab === tab ? "#c9a84c" : "rgba(240,230,200,0.3)",
                cursor: "pointer", fontFamily: "monospace", marginBottom: -1,
              }}>{tab}</button>
            ))}
          </div>

          {adminTab === "control" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#f0e6c8" }}>Infinite Balance</div>
                  <div style={{ fontSize: 10, color: "rgba(240,230,200,0.35)" }}>Cases kosten nichts</div>
                </div>
                <input type="checkbox" checked={infiniteBalance} onChange={() => {
                  const n = !infiniteBalRef.current; infiniteBalRef.current = n; setInfiniteBalance(n);
                }} style={{ width: 14, height: 14, cursor: "pointer" }} />
              </label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#f0e6c8" }}>Auto Open</div>
                  <div style={{ fontSize: 10, color: "rgba(240,230,200,0.35)" }}>Öffnet automatisch weiter</div>
                </div>
                <input type="checkbox" checked={autoOpen} onChange={() => {
                  const n = !autoOpenRef.current; autoOpenRef.current = n; setAutoOpen(n);
                }} style={{ width: 14, height: 14, cursor: "pointer" }} />
              </label>
              <div>
                <div style={{ color: "rgba(240,230,200,0.4)", fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>FORCE RARITY</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(Object.keys(RARITY_CONFIG) as Rarity[]).map(r => {
                    const cfg = RARITY_CONFIG[r];
                    const active = forceRarity === r;
                    return (
                      <button key={r} onClick={() => {
                        const next = active ? null : r;
                        forceRarityRef.current = next;
                        setForceRarity(next);
                      }} style={{
                        padding: "4px 7px", borderRadius: 5, fontSize: 10,
                        background: active ? `rgba(${hexToRgb(cfg.color)},0.2)` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${active ? cfg.color : "rgba(255,255,255,0.1)"}`,
                        color: cfg.color, cursor: "pointer", fontFamily: "monospace",
                      }}>{r}</button>
                    );
                  })}
                </div>
                {forceRarity && <div style={{ fontSize: 10, color: "#c9a84c", marginTop: 4 }}>Force: {RARITY_CONFIG[forceRarity].label}</div>}
              </div>
              <button onClick={() => setCaseStats({ opened: 0, spent: 0, won: 0, byRarity: {} })}
                style={{ padding: "5px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, color: "rgba(240,230,200,0.4)", cursor: "pointer", fontSize: 10, letterSpacing: 1 }}>
                RESET STATS
              </button>
            </div>
          )}

          {adminTab === "stats" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                {[
                  { l: "CASES", v: String(caseStats.opened), c: "#f0e6c8" },
                  { l: "NET P&L", v: `${caseStats.won - caseStats.spent >= 0 ? "+" : ""}$${(caseStats.won - caseStats.spent).toFixed(0)}`, c: caseStats.won >= caseStats.spent ? "#4ade80" : "#f87171" },
                  { l: "SPENT", v: `$${caseStats.spent.toFixed(0)}`, c: "#f87171" },
                  { l: "WON", v: `$${caseStats.won.toFixed(0)}`, c: "#4ade80" },
                ].map(s => (
                  <div key={s.l} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "7px 4px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 15, fontWeight: "bold", color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 9, color: "rgba(240,230,200,0.4)", letterSpacing: 1 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {Object.keys(caseStats.byRarity).length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: "rgba(240,230,200,0.4)", letterSpacing: 1, marginBottom: 6 }}>DROPS BY RARITY</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(Object.entries(caseStats.byRarity) as [Rarity, number][])
                      .sort((a, b) => RARITY_CONFIG[a[0]].weight - RARITY_CONFIG[b[0]].weight)
                      .map(([r, count]) => {
                        const cfg = RARITY_CONFIG[r];
                        const pct = caseStats.opened > 0 ? ((count / caseStats.opened) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: cfg.color }}>{cfg.label}</span>
                            <span style={{ fontSize: 10, color: "rgba(240,230,200,0.5)", fontFamily: "monospace" }}>{count}× ({pct}%)</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminPanel>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}
  // loadBalance is safe during SSR (returns STARTING_BALANCE if window undefined)
