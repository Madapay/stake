import { useState, useCallback } from "react";
import {
  GameType,
  GAMES,
  calculateGameResult,
  sha256Hex,
  SpinResult,
  GameResultData,
  DiceResult,
  LimboResult,
  WheelResult,
  RouletteResult,
  DiamondsResult,
  PlinkoResult,
  MinesResult,
  KenoResult,
  CardsResult,
  VideoPokerResult,
  CrashResult,
  FlipResult,
  SnakesResult,
  RockPaperScissorsResult,
  ChickenResult,
  PumpResult,
  KENO_MULTIPLIERS,
  minesMultiplier,
} from "@/lib/provably-fair";
import { Lang, T, translations } from "@/lib/i18n";

const ROULETTE_COLORS: Record<number, "red" | "black" | "green"> = {
  0: "green",
  1: "red", 2: "black", 3: "red", 4: "black", 5: "red", 6: "black",
  7: "red", 8: "black", 9: "red", 10: "black", 11: "black", 12: "red",
  13: "black", 14: "red", 15: "black", 16: "red", 17: "black", 18: "red",
  19: "red", 20: "black", 21: "red", 22: "black", 23: "red", 24: "black",
  25: "red", 26: "black", 27: "red", 28: "black", 29: "black", 30: "red",
  31: "black", 32: "red", 33: "black", 34: "red", 35: "black", 36: "red",
};

function getSpinValue(result: GameResultData): number | null {
  switch (result.type) {
    case "dice": { const roll = (result as DiceResult).roll; return roll > 0 ? 99 / roll : 9999; }
    case "limbo": return (result as LimboResult).multiplier;
    case "crash": return (result as CrashResult).multiplier;
    case "wheel": return (result as WheelResult).payout;
    case "roulette": return (result as RouletteResult).pocket;
    case "plinko": return (result as PlinkoResult).multiplier;
    case "keno": return (result as KenoResult).multiplier;
    case "flip": return (result as FlipResult).flips.filter((f) => f === "Tura" || f === "Heads").length;
    case "snakes": return (result as SnakesResult).rolls.reduce((a, b) => a + b, 0);
    default: return null;
  }
}

function getTargetHintKey(game: string): keyof T {
  if (game === "dice") return "targetFilterHintDice";
  if (game === "limbo" || game === "crash") return "targetFilterHintMult";
  if (game === "wheel") return "targetFilterHintPayout";
  if (game === "roulette") return "targetFilterHintPocket";
  if (game === "plinko") return "targetFilterHintMult";
  if (game === "keno") return "targetFilterHintMult";
  if (game === "flip") return "targetFilterHintFlip";
  if (game === "snakes") return "targetFilterHintHits";
  return "targetFilterHint";
}

function ResultDisplay({ result, t, selectedMinesCells }: { result: GameResultData; t: T; selectedMinesCells?: Set<number> }) {
  switch (result.type) {
    case "dice": {
      const r = result as DiceResult;
      const mult = r.roll > 0 ? 99 / r.roll : 9999;
      return (
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-emerald-400">{mult.toFixed(2)}x</div>
          <div className="text-sm text-slate-400">({r.roll.toFixed(2)} / 100.00)</div>
        </div>
      );
    }
    case "limbo": {
      const r = result as LimboResult;
      return (
        <div className="text-3xl font-bold text-yellow-400">{r.multiplier.toFixed(2)}x</div>
      );
    }
    case "crash": {
      const r = result as CrashResult;
      return (
        <div className={`text-3xl font-bold ${r.multiplier >= 2 ? "text-emerald-400" : "text-red-400"}`}>
          {r.multiplier.toFixed(2)}x
        </div>
      );
    }
    case "wheel": {
      const r = result as WheelResult;
      return (
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${r.payout > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {r.payout > 0 ? `${r.payout}x` : "0x"}
          </div>
          <div className="text-sm text-slate-400">Segment #{r.segment + 1}</div>
        </div>
      );
    }
    case "roulette": {
      const r = result as RouletteResult;
      const color = ROULETTE_COLORS[r.pocket];
      const colorLabel = t[color as "red" | "black" | "green"];
      return (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${
              color === "red" ? "bg-red-600" : color === "black" ? "bg-slate-800 border border-slate-600" : "bg-emerald-600"
            }`}
          >
            {r.pocket}
          </div>
          <div className="capitalize text-slate-300">{colorLabel}</div>
        </div>
      );
    }
    case "diamonds": {
      const r = result as DiamondsResult;
      const gemKey: Record<string, keyof T> = {
        Yeşil: "gemGreen", Green: "gemGreen",
        Mor: "gemPurple", Purple: "gemPurple",
        Sarı: "gemYellow", Yellow: "gemYellow",
        Kırmızı: "gemRed", Red: "gemRed",
        Cyan: "gemCyan",
        Pembe: "gemPink", Pink: "gemPink",
        Mavi: "gemBlue", Blue: "gemBlue",
      };
      const gemColors: Record<string, string> = {
        gemGreen: "text-emerald-400", gemPurple: "text-purple-400", gemYellow: "text-yellow-400",
        gemRed: "text-red-400", gemCyan: "text-cyan-400", gemPink: "text-pink-400", gemBlue: "text-blue-400",
      };
      return (
        <div className="flex gap-2 flex-wrap">
          {r.gems.map((gem, i) => {
            const key = gemKey[gem] || "gemBlue";
            return (
              <span key={i} className={`font-semibold ${gemColors[key] || "text-white"} text-sm bg-slate-700 px-2 py-1 rounded`}>
                ♦ {t[key as keyof T] as string}
              </span>
            );
          })}
        </div>
      );
    }
    case "plinko": {
      const r = result as PlinkoResult;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold text-lg">{r.multiplier}x</span>
            <span className="text-slate-400 text-sm">{t.slot}: {r.slot}</span>
          </div>
          <div className="text-xs text-slate-500 font-mono break-all">{r.path.join(" → ")}</div>
        </div>
      );
    }
    case "mines": {
      const r = result as MinesResult;
      const mineSet = new Set(r.mines);
      const hasCellSelection = selectedMinesCells && selectedMinesCells.size > 0;

      if (hasCellSelection) {
        const selectedArr = Array.from(selectedMinesCells);
        const hitMines = selectedArr.filter(pos => mineSet.has(pos));
        const allSafe = hitMines.length === 0;
        return (
          <div className="space-y-1.5 w-full">
            <div className={`flex items-center gap-2 text-sm font-semibold ${allSafe ? "text-emerald-400" : "text-red-400"}`}>
              {allSafe
                ? "✓ Tüm kareler güvenli!"
                : `💣 ${hitMines.length} mayına bastı`}
              <span className="text-slate-500 font-normal text-xs">({selectedMinesCells.size} kare seçildi)</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 25 }, (_, i) => i).map((pos) => {
                const isMine = mineSet.has(pos);
                const isSelected = selectedMinesCells.has(pos);
                return (
                  <div
                    key={pos}
                    title={`Kare ${pos + 1}${isSelected ? (isMine ? " — MAYINLI!" : " — Güvenli") : (isMine ? " — Mayın (seçilmedi)" : "")}`}
                    className={`
                      aspect-square rounded flex items-center justify-center text-sm font-bold
                      transition-colors select-none
                      ${isSelected && isMine  ? "bg-red-700 border-2 border-red-400 shadow-md shadow-red-900/50 text-white"
                      : isSelected && !isMine ? "bg-emerald-700 border-2 border-emerald-400 shadow-md shadow-emerald-900/40 text-white"
                      : isMine               ? "bg-red-950 border border-red-900 text-red-800 opacity-60"
                      :                        "bg-slate-800 border border-slate-700 text-slate-600 opacity-40"}
                    `}
                  >
                    {isSelected && isMine ? "💣"
                      : isSelected && !isMine ? "💎"
                      : isMine ? "💣"
                      : "·"}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      /* no cell selection: show full grid */
      return (
        <div className="space-y-1.5 w-full">
          <div className="flex gap-1.5 text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-600"></span>
              💣 {r.mines.length} mayın
            </span>
            <span className="flex items-center gap-1 ml-3">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-700"></span>
              {25 - r.mines.length} güvenli
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 25 }, (_, i) => i).map((pos) => {
              const isMine = mineSet.has(pos);
              return (
                <div
                  key={pos}
                  title={`Kare ${pos + 1}${isMine ? " — MAYINLI" : ""}`}
                  className={`
                    aspect-square rounded flex items-center justify-center text-base font-bold
                    transition-colors select-none
                    ${isMine
                      ? "bg-red-700 border border-red-500 shadow shadow-red-900 text-white"
                      : "bg-slate-700 border border-slate-600 text-emerald-400"}
                  `}
                >
                  {isMine ? "💣" : "💎"}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case "pump": {
      const r = result as PumpResult;
      return (
        <div className="space-y-1">
          <div className="text-sm text-slate-400">{t.popOrder}</div>
          <div className="flex gap-1 flex-wrap">
            {r.pops.slice(0, 24).map((pos, i) => (
              <span key={i} className="text-xs bg-slate-700 text-orange-400 px-1.5 py-0.5 rounded font-mono">
                {pos + 1}
              </span>
            ))}
          </div>
        </div>
      );
    }
    case "chicken": {
      const r = result as ChickenResult;
      return (
        <div className="space-y-1">
          <div className="text-sm text-slate-400">{t.deathPositions}</div>
          <div className="flex gap-1 flex-wrap">
            {r.deaths.slice(0, 20).map((pos, i) => (
              <span key={i} className="text-xs bg-slate-700 text-red-400 px-1.5 py-0.5 rounded font-mono">
                {pos + 1}
              </span>
            ))}
          </div>
        </div>
      );
    }
    case "keno": {
      const r = result as KenoResult;
      const allNums = Array.from({ length: 40 }, (_, i) => i + 1);
      const hitSet = new Set(r.hits);
      const selSet = new Set(r.selected);
      const hasSelected = r.selected.length > 0;
      return (
        <div className="space-y-2">
          {hasSelected && (
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold text-lg">{r.multiplier}x</span>
              <span className="text-slate-400 text-sm">{r.matchCount}/{r.selected.length} {t.kenoMatchCount}</span>
            </div>
          )}
          <div className="grid grid-cols-10 gap-0.5">
            {allNums.map((n) => {
              const isHit = hitSet.has(n);
              const isSel = selSet.has(n);
              let cls = "bg-slate-700 text-slate-500";
              if (isSel && isHit) cls = "bg-emerald-500 text-slate-900 ring-2 ring-yellow-400";
              else if (isSel && !isHit) cls = "bg-yellow-600 text-yellow-100";
              else if (isHit && !isSel) cls = "bg-slate-500 text-slate-200";
              return (
                <div
                  key={n}
                  className={`w-7 h-7 rounded text-xs flex items-center justify-center font-bold ${cls}`}
                >
                  {n}
                </div>
              );
            })}
          </div>
          {hasSelected && (
            <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
              <span><span className="inline-block w-3 h-3 rounded bg-emerald-500 mr-1"></span>{t.kenoLegendHit}</span>
              <span><span className="inline-block w-3 h-3 rounded bg-yellow-600 mr-1"></span>{t.kenoLegendSelected}</span>
              <span><span className="inline-block w-3 h-3 rounded bg-slate-500 mr-1"></span>{t.kenoLegendDrawn}</span>
            </div>
          )}
        </div>
      );
    }
    case "cards": {
      const r = result as CardsResult;
      return (
        <div className="flex gap-1 flex-wrap">
          {r.cards.map((card, i) => {
            const isRed = card.startsWith("♦") || card.startsWith("♥");
            return (
              <span key={i} className={`text-sm font-bold bg-white px-1.5 py-0.5 rounded shadow ${isRed ? "text-red-600" : "text-slate-900"}`}>
                {card}
              </span>
            );
          })}
        </div>
      );
    }
    case "video-poker": {
      const r = result as VideoPokerResult;
      return (
        <div className="flex gap-1 flex-wrap">
          {r.cards.map((card, i) => {
            const isRed = card.startsWith("♦") || card.startsWith("♥");
            return (
              <span key={i} className={`text-sm font-bold bg-white px-1.5 py-0.5 rounded shadow ${isRed ? "text-red-600" : "text-slate-900"}`}>
                {card}
              </span>
            );
          })}
        </div>
      );
    }
    case "flip": {
      const r = result as FlipResult;
      const headsCount = r.flips.filter((f) => f === "Tura" || f === "Heads").length;
      return (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-emerald-400 font-bold">{headsCount} {t.heads}</span>
            <span className="text-slate-400"> / </span>
            <span className="text-slate-300 font-bold">{r.flips.length - headsCount} {t.tails}</span>
          </div>
          <div className="flex gap-0.5 flex-wrap">
            {r.flips.map((f, i) => {
              const isHeads = f === "Tura" || f === "Heads";
              return (
                <span key={i} className={`text-xs px-1 py-0.5 rounded font-mono ${isHeads ? "bg-emerald-700 text-emerald-200" : "bg-slate-600 text-slate-300"}`}>
                  {isHeads ? t.heads[0] : t.tails[0]}
                </span>
              );
            })}
          </div>
        </div>
      );
    }
    case "snakes": {
      const r = result as SnakesResult;
      const pairs: number[][] = [];
      for (let i = 0; i < r.rolls.length; i += 2) {
        pairs.push(r.rolls.slice(i, i + 2));
      }
      return (
        <div className="space-y-1">
          {pairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">{t.round} {i + 1}:</span>
              {pair.map((roll, j) => (
                <span key={j} className="bg-slate-700 text-white text-sm font-bold px-2 py-0.5 rounded">🎲 {roll}</span>
              ))}
              <span className="text-emerald-400 text-sm font-semibold">= {pair.reduce((a, b) => a + b, 0)}</span>
            </div>
          ))}
        </div>
      );
    }
    case "rock-paper-scissors": {
      const r = result as RockPaperScissorsResult;
      const icons: Record<string, string> = { Taş: "🪨", Rock: "🪨", Kağıt: "📄", Paper: "📄", Makas: "✂️", Scissors: "✂️" };
      const labelMap: Record<string, keyof T> = { Taş: "rock", Rock: "rock", Kağıt: "paper", Paper: "paper", Makas: "scissors", Scissors: "scissors" };
      return (
        <div className="flex gap-2 flex-wrap">
          {r.choices.map((c, i) => (
            <div key={i} className="flex flex-col items-center bg-slate-700 rounded px-2 py-1">
              <span className="text-lg">{icons[c]}</span>
              <span className="text-xs text-slate-400">{t[labelMap[c] as keyof T] as string}</span>
            </div>
          ))}
        </div>
      );
    }
    default:
      return <div className="text-slate-400">—</div>;
  }
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("tr");
  const t = translations[lang];

  const [serverSeed, setServerSeed] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [nonceStart, setNonceStart] = useState(1);
  const [nonceCount, setNonceCount] = useState(10);
  const [selectedGame, setSelectedGame] = useState<GameType>("dice");
  const [wheelSegments, setWheelSegments] = useState("10");
  const [wheelRisk, setWheelRisk] = useState("medium");
  const [plinkoRows, setPlinkoRows] = useState(16);
  const [plinkoRisk, setPlinkoRisk] = useState("medium");
  const [kenoRisk, setKenoRisk] = useState("classic");
  const [kenoSelected, setKenoSelected] = useState<Set<number>>(new Set());
  const [mineCount, setMineCount] = useState(3);
  const [selectedMinesCells, setSelectedMinesCells] = useState<Set<number>>(new Set());
  const [minesShowSafeOnly, setMinesShowSafeOnly] = useState(false);
  const [limboTarget, setLimboTarget] = useState<number | "">(2);
  const [targetFilter, setTargetFilter] = useState<number | "">("");
  const [limboSort, setLimboSort] = useState<"nonce" | "multiplier">("nonce");
  const [results, setResults] = useState<SpinResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverSeedHash, setServerSeedHash] = useState("");
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [activeTab, setActiveTab] = useState<"calculator" | "verifier">("calculator");

  const calculateAll = useCallback(async () => {
    if (!serverSeed || !clientSeed) return;
    setLoading(true);
    try {
      const spinResults: SpinResult[] = [];
      for (let n = nonceStart; n < nonceStart + nonceCount; n++) {
        const result = await calculateGameResult(selectedGame, serverSeed, clientSeed, n, {
          wheelSegments,
          wheelRisk,
          plinkoRows,
          plinkoRisk,
          mineCount,
          kenoRisk,
          kenoSelected: Array.from(kenoSelected),
        });
        spinResults.push({ nonce: n, game: selectedGame, result });
      }
      setResults(spinResults);
    } finally {
      setLoading(false);
    }
  }, [serverSeed, clientSeed, nonceStart, nonceCount, selectedGame, wheelSegments, wheelRisk, plinkoRows, plinkoRisk, mineCount, kenoRisk, kenoSelected]);

  const hashSeed = useCallback(async () => {
    if (!serverSeed) return;
    const hash = await sha256Hex(serverSeed);
    setServerSeedHash(hash);
  }, [serverSeed]);

  const verifyHash = useCallback(async () => {
    if (!hashInput) return;
    const hash = await sha256Hex(hashInput);
    setVerifiedHash(hash);
  }, [hashInput]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 font-black text-sm shrink-0">
              PF
            </div>
            <h1 className="font-bold text-lg truncate">{t.appTitle}</h1>
            <span className="text-slate-400 text-sm hidden sm:block">{t.appSubtitle}</span>
          </div>
          <div className="shrink-0 flex items-center gap-1 bg-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setLang("tr")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                lang === "tr" ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇹🇷 TR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                lang === "en" ? "bg-slate-900 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "calculator" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {t.tabCalculator}
          </button>
          <button
            onClick={() => setActiveTab("verifier")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "verifier" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {t.tabVerifier}
          </button>
        </div>

        {activeTab === "calculator" ? (
          <>
            {/* TOP: Game Selection */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <label className="text-sm text-slate-400 block mb-2 font-semibold">{t.gameSelect}</label>
              <select
                value={selectedGame}
                onChange={(e) => { setSelectedGame(e.target.value as GameType); setTargetFilter(""); setSelectedMinesCells(new Set()); setMinesShowSafeOnly(false); }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {(["dice", "limbo", "plinko", "wheel", "mines"] as GameType[]).map((key) => (
                  <option key={key} value={key}>{GAMES[key].name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">{GAMES[selectedGame].description}</p>
            </div>

            {/* BOTTOM: Seed info + game-specific options + Calculate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seed fields */}
              <div className="bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
                <h2 className="font-semibold text-slate-200">{t.seedInfo}</h2>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">{t.serverSeed}</label>
                  <input
                    type="text"
                    value={serverSeed}
                    onChange={(e) => setServerSeed(e.target.value)}
                    placeholder={t.serverSeedPlaceholder}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {serverSeed && (
                    <button onClick={hashSeed} className="mt-1 text-xs text-emerald-400 hover:text-emerald-300">
                      {t.generateHash}
                    </button>
                  )}
                  {serverSeedHash && (
                    <p className="text-xs text-slate-400 mt-1 font-mono break-all">
                      {t.hashLabel} {serverSeedHash}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">{t.clientSeed}</label>
                  <input
                    type="text"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    placeholder={t.clientSeedPlaceholder}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">{t.startNonce}</label>
                    <input
                      type="number"
                      value={nonceStart}
                      onChange={(e) => setNonceStart(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">{t.spinCount}</label>
                    <input
                      type="number"
                      value={nonceCount}
                      onChange={(e) => setNonceCount(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Game-specific options + Target filter + Calculate */}
              <div className="bg-slate-800 rounded-xl p-4 space-y-4 border border-slate-700 flex flex-col">
                <h2 className="font-semibold text-slate-200">{t.gameOptions}</h2>

                {selectedGame === "wheel" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">{t.wheelSegments}</label>
                      <select
                        value={wheelSegments}
                        onChange={(e) => setWheelSegments(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        {["10", "20", "30", "40", "50"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">{t.wheelRisk}</label>
                      <select
                        value={wheelRisk}
                        onChange={(e) => setWheelRisk(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="low">{t.riskLow}</option>
                        <option value="medium">{t.riskMedium}</option>
                        <option value="high">{t.riskHigh}</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedGame === "plinko" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">{t.plinkoRisk}</label>
                      <select
                        value={plinkoRisk}
                        onChange={(e) => setPlinkoRisk(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="low">{t.riskLow}</option>
                        <option value="medium">{t.riskMedium}</option>
                        <option value="high">{t.riskHigh}</option>
                        <option value="expert">{t.riskExpert}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">{t.plinkoRows}</label>
                      <select
                        value={plinkoRows}
                        onChange={(e) => setPlinkoRows(parseInt(e.target.value))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        {Array.from({ length: 9 }, (_, i) => i + 8).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {selectedGame === "keno" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">{t.kenoRisk}</label>
                      <select
                        value={kenoRisk}
                        onChange={(e) => setKenoRisk(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="classic">{t.riskClassic}</option>
                        <option value="low">{t.riskLow}</option>
                        <option value="medium">{t.riskMedium}</option>
                        <option value="high">{t.riskHigh}</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">{t.kenoSelectNums}</label>
                        <div className="flex items-center gap-2">
                          {kenoSelected.size > 0 && (
                            <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full font-semibold">
                              {kenoSelected.size} {t.kenoSelectedCount}
                            </span>
                          )}
                          {kenoSelected.size > 0 && (
                            <button
                              onClick={() => setKenoSelected(new Set())}
                              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                            >
                              {t.kenoClearSelection}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{t.kenoSelectHint}</p>
                      <div className="grid grid-cols-8 gap-1">
                        {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => {
                          const isSelected = kenoSelected.has(n);
                          return (
                            <button
                              key={n}
                              onClick={() => {
                                const next = new Set(kenoSelected);
                                if (isSelected) {
                                  next.delete(n);
                                } else if (next.size < 10) {
                                  next.add(n);
                                }
                                setKenoSelected(next);
                              }}
                              className={`h-8 rounded text-xs font-bold transition-colors ${
                                isSelected
                                  ? "bg-yellow-500 text-slate-900"
                                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      {kenoSelected.size > 0 && (() => {
                        const mults = KENO_MULTIPLIERS[kenoRisk]?.[kenoSelected.size] || [];
                        return (
                          <div className="mt-2 p-2 bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1.5 font-semibold">İsabet → Çarpan</p>
                            <div className="flex flex-wrap gap-1">
                              {mults.map((m, i) => (
                                <span
                                  key={i}
                                  className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                                    m > 1 ? "bg-emerald-800 text-emerald-300" :
                                    m > 0 ? "bg-slate-600 text-slate-300" :
                                    "bg-slate-700 text-slate-500"
                                  }`}
                                >
                                  {i}/{kenoSelected.size}→{m}x
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {selectedGame === "mines" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">{t.mineCount}</label>
                      <input
                        type="number"
                        value={mineCount}
                        onChange={(e) => {
                          const newCount = Math.min(24, Math.max(1, parseInt(e.target.value) || 1));
                          setMineCount(newCount);
                          const maxSafe = 25 - newCount;
                          setSelectedMinesCells(prev => {
                            if (prev.size <= maxSafe) return prev;
                            const trimmed = Array.from(prev).slice(0, maxSafe);
                            return new Set(trimmed);
                          });
                        }}
                        min={1}
                        max={24}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">{t.mineSelectCells}</label>
                        <div className="flex items-center gap-2">
                          {selectedMinesCells.size > 0 && (
                            <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                              {selectedMinesCells.size} {t.mineSelectedCount}
                              {" → "}
                              <span className="text-yellow-300">{minesMultiplier(selectedMinesCells.size, mineCount)}x</span>
                            </span>
                          )}
                          {selectedMinesCells.size > 0 && (
                            <button
                              onClick={() => setSelectedMinesCells(new Set())}
                              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                            >
                              {t.mineClearSelection}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }, (_, i) => i).map((pos) => {
                          const isSelected = selectedMinesCells.has(pos);
                          return (
                            <button
                              key={pos}
                              onClick={() => setSelectedMinesCells(prev => {
                                const next = new Set(prev);
                                if (next.has(pos)) {
                                  next.delete(pos);
                                } else if (next.size < 25 - mineCount) {
                                  next.add(pos);
                                }
                                return next;
                              })}
                              title={`Kare ${pos + 1}`}
                              className={`
                                aspect-square rounded flex items-center justify-center text-xs font-bold
                                transition-all select-none cursor-pointer
                                ${isSelected
                                  ? "bg-emerald-600 border-2 border-emerald-400 text-white shadow-md shadow-emerald-900/50 scale-105"
                                  : "bg-slate-700 border border-slate-600 text-slate-500 hover:bg-slate-600 hover:text-slate-200 hover:border-slate-400"}
                              `}
                            >
                              {isSelected ? "✓" : pos + 1}
                            </button>
                          );
                        })}
                      </div>
                      {selectedMinesCells.size === 0 && (
                        <p className="text-xs text-slate-500 mt-1.5">{t.mineSelectHint}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Universal target filter — hidden for mines (uses cell selection instead) */}
                {selectedGame !== "mines" && (
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">{t.targetFilter}</label>
                    <input
                      type="number"
                      value={targetFilter}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") setTargetFilter("");
                        else setTargetFilter(parseFloat(v));
                      }}
                      step={0.01}
                      placeholder={t.targetFilterPlaceholder}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {t[getTargetHintKey(selectedGame)] as string}
                    </p>
                  </div>
                )}

                <div className="mt-auto">
                  <button
                    onClick={calculateAll}
                    disabled={loading || !serverSeed || !clientSeed}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    {loading ? t.calculating : t.calcButton}
                  </button>
                </div>
              </div>
            </div>

            {/* ── LIMBO: always-visible table ── */}
            {selectedGame === "limbo" && (() => {
              const isFiltered = targetFilter !== "";
              const target = typeof targetFilter === "number" ? targetFilter : 0;
              const limboResults = results.filter((s) => s.result.type === "limbo") as SpinResult[];
              const hits = isFiltered ? limboResults.filter((s) => (s.result as LimboResult).multiplier >= target) : [];
              const sortedAll = [...limboResults].sort((a, b) => {
                if (limboSort === "multiplier") {
                  return (b.result as LimboResult).multiplier - (a.result as LimboResult).multiplier;
                }
                return a.nonce - b.nonce;
              });
              const rows = isFiltered ? sortedAll.filter((s) => (s.result as LimboResult).multiplier >= target) : sortedAll;

              return (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {/* header */}
                  <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-semibold text-slate-200">
                      {t.resultsTitle}
                      {limboResults.length > 0 && (
                        <span className="ml-2 text-slate-400 font-normal text-sm">
                          ({isFiltered ? `${hits.length} / ${limboResults.length}` : limboResults.length} {t.spins})
                        </span>
                      )}
                      {isFiltered && limboResults.length > 0 && (
                        <span className={`ml-3 px-2 py-0.5 rounded-full text-sm font-bold ${hits.length > 0 ? "bg-emerald-700 text-emerald-200" : "bg-slate-700 text-slate-400"}`}>
                          {hits.length} / {limboResults.length} {t.hits} ≥ {target}x
                        </span>
                      )}
                    </h2>
                    {/* sort toggles */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm">
                        <input
                          type="checkbox"
                          checked={limboSort === "nonce"}
                          onChange={() => setLimboSort("nonce")}
                          className="accent-emerald-500 w-4 h-4"
                        />
                        <span className={limboSort === "nonce" ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                          {t.sortByNonce}
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm">
                        <input
                          type="checkbox"
                          checked={limboSort === "multiplier"}
                          onChange={() => setLimboSort("multiplier")}
                          className="accent-yellow-400 w-4 h-4"
                        />
                        <span className={limboSort === "multiplier" ? "text-yellow-400 font-semibold" : "text-slate-400"}>
                          {t.sortByMultiplier}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-900/60">
                          <th className="px-4 py-2.5 text-left text-slate-400 font-semibold w-12">{t.colIndex}</th>
                          <th className="px-4 py-2.5 text-left text-slate-400 font-semibold">{t.colNonce}</th>
                          <th className="px-4 py-2.5 text-left text-slate-400 font-semibold">{t.colMultiplier}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                              <div className="text-3xl mb-2">🎯</div>
                              <p>{t.noResults}</p>
                              <p className="text-xs mt-1 text-slate-600">{t.noResultsHint}</p>
                            </td>
                          </tr>
                        ) : (
                          rows.map((spin, idx) => {
                            const mult = (spin.result as LimboResult).multiplier;
                            const isHit = isFiltered && mult >= target;
                            return (
                              <tr
                                key={spin.nonce}
                                className={`transition-colors ${
                                  isHit
                                    ? "bg-emerald-900/20 border-l-2 border-l-emerald-500"
                                    : "hover:bg-slate-700/30"
                                }`}
                              >
                                <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{idx + 1}</td>
                                <td className="px-4 py-2.5 font-mono font-bold text-slate-300">{spin.nonce}</td>
                                <td className={`px-4 py-2.5 font-mono font-bold text-base ${
                                  isHit ? "text-emerald-400" : mult >= 2 ? "text-yellow-400" : "text-slate-300"
                                }`}>
                                  {mult.toFixed(2)}x
                                  {isHit && (
                                    <span className="ml-2 text-xs bg-emerald-700 text-emerald-200 px-1.5 py-0.5 rounded-full font-normal align-middle">
                                      {t.hitBadge}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* ── Other games: always-visible card list ── */}
            {selectedGame !== "limbo" && (() => {
              const isMines = selectedGame === "mines";
              const hasCellSel = isMines && selectedMinesCells.size > 0;
              const isFiltered = !isMines && targetFilter !== "";
              const target = typeof targetFilter === "number" ? targetFilter : 0;
              const isRoulette = selectedGame === "roulette";

              /* mines: safe-only filter */
              const safeResults = hasCellSel && minesShowSafeOnly
                ? results.filter(s => !Array.from(selectedMinesCells).some(pos => new Set((s.result as MinesResult).mines).has(pos)))
                : results;
              const safeCount = hasCellSel
                ? results.filter(s => !Array.from(selectedMinesCells).some(pos => new Set((s.result as MinesResult).mines).has(pos))).length
                : 0;

              const hits = isFiltered
                ? results.filter((s) => {
                    const v = getSpinValue(s.result);
                    if (v === null) return false;
                    return isRoulette ? v === target : v >= target;
                  })
                : [];

              /* when filter active: show only matching results */
              const filteredHits = isFiltered ? hits : results;
              const displayResults = isMines
                ? (minesShowSafeOnly ? safeResults : results)
                : (isFiltered ? filteredHits : results);

              return (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-semibold text-slate-200">
                      {t.resultsTitle}
                      {results.length > 0 && (
                        <span className="ml-2 text-slate-400 font-normal text-sm">
                          ({isFiltered
                            ? `${hits.length} / ${results.length}`
                            : minesShowSafeOnly
                            ? `${safeResults.length} / ${results.length}`
                            : results.length} {t.spins})
                        </span>
                      )}
                      {hasCellSel && results.length > 0 && (
                        <span className={`ml-3 px-2 py-0.5 rounded-full text-sm font-bold ${safeCount > 0 ? "bg-emerald-700 text-emerald-200" : "bg-slate-700 text-slate-400"}`}>
                          {safeCount} / {results.length} {t.mineShowSafeOnly}
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-3">
                      {hasCellSel && results.length > 0 && (
                        <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm">
                          <input
                            type="checkbox"
                            checked={minesShowSafeOnly}
                            onChange={(e) => setMinesShowSafeOnly(e.target.checked)}
                            className="accent-emerald-500 w-4 h-4"
                          />
                          <span className={minesShowSafeOnly ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                            {t.mineShowSafeOnly}
                          </span>
                        </label>
                      )}
                      {isFiltered && results.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">
                            <span className="font-bold text-yellow-400">{target}</span>
                            {" "}{isRoulette ? "=" : "≥"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${hits.length > 0 ? "bg-emerald-700 text-emerald-200" : "bg-slate-700 text-slate-400"}`}>
                            {hits.length} / {results.length} {t.hits}
                          </span>
                        </div>
                      )}
                      {results.length > 0 && (
                        <span className="text-sm text-slate-400">
                          {GAMES[selectedGame].name} · Nonce {results[0].nonce} – {results[results.length - 1].nonce}
                        </span>
                      )}
                    </div>
                  </div>
                  {results.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <div className="text-3xl mb-2">🎲</div>
                      <p>{t.noResults}</p>
                      <p className="text-xs mt-1 text-slate-600">{t.noResultsHint}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {displayResults.map((spin) => {
                        const isMinesGame = spin.result.type === "mines";
                        const v = isFiltered && !isMinesGame ? getSpinValue(spin.result) : null;
                        const isHit = isFiltered && v !== null && (isRoulette ? v === target : v >= target);
                        /* mines with cell selection: determine safe/boom */
                        const minesAllSafe = isMinesGame && hasCellSel && !Array.from(selectedMinesCells).some(pos => new Set((spin.result as MinesResult).mines).has(pos));
                        const minesBoom = isMinesGame && hasCellSel && !minesAllSafe;
                        return (
                          <div
                            key={spin.nonce}
                            className={`px-4 py-3 flex items-start gap-4 transition-colors ${
                              minesAllSafe ? "bg-emerald-900/20 border-l-2 border-emerald-500"
                              : minesBoom   ? "bg-red-900/20 border-l-2 border-red-600"
                              : isHit       ? "bg-emerald-900/30 border-l-2 border-emerald-500"
                              : ""
                            }`}
                          >
                            <div className="shrink-0 w-16">
                              <div className="text-xs text-slate-500">{t.nonce}</div>
                              <div className={`font-mono font-bold ${minesAllSafe ? "text-emerald-300" : minesBoom ? "text-red-400" : isHit ? "text-emerald-300" : "text-slate-300"}`}>{spin.nonce}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <ResultDisplay result={spin.result} t={t} selectedMinesCells={isMinesGame ? selectedMinesCells : undefined} />
                            </div>
                            {(minesAllSafe || isHit) && (
                              <div className="shrink-0">
                                <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">{t.hitBadge}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
              <h2 className="font-semibold text-slate-200">{t.verifierTitle}</h2>
              <p className="text-sm text-slate-400">{t.verifierDesc}</p>
              <div>
                <label className="text-sm text-slate-400 block mb-1">{t.unhashedSeed}</label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder={t.unhashedSeedPlaceholder}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                onClick={verifyHash}
                disabled={!hashInput}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {t.calcHashButton}
              </button>
              {verifiedHash && (
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">{t.sha256HashLabel}</p>
                  <p className="font-mono text-emerald-400 text-sm break-all">{verifiedHash}</p>
                  <p className="text-xs text-slate-400 mt-2">{t.verifierCompareTip}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <h2 className="font-semibold text-slate-200">{t.howItWorks}</h2>
              <div className="space-y-3 text-sm text-slate-400">
                {[t.howStep1, t.howStep2, t.howStep3, t.howStep4].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-emerald-700 rounded-full text-emerald-200 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
