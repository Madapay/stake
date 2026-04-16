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

function ResultDisplay({ result, t }: { result: GameResultData; t: T }) {
  switch (result.type) {
    case "dice": {
      const r = result as DiceResult;
      return (
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-emerald-400">{r.roll.toFixed(2)}</div>
          <div className="text-sm text-slate-400">/ 100.00</div>
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
          <div className="text-emerald-400 font-bold">{t.slot}: {r.slot}</div>
          <div className="text-xs text-slate-400 font-mono break-all">{r.path.join(" → ")}</div>
        </div>
      );
    }
    case "mines": {
      const r = result as MinesResult;
      const grid = Array.from({ length: 25 }, (_, i) => i);
      return (
        <div className="grid grid-cols-5 gap-1">
          {grid.map((pos) => (
            <div
              key={pos}
              className={`w-8 h-8 rounded text-xs flex items-center justify-center font-bold ${
                r.mines.includes(pos) ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400"
              }`}
            >
              {r.mines.includes(pos) ? "💣" : pos + 1}
            </div>
          ))}
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
      return (
        <div className="grid grid-cols-10 gap-0.5">
          {allNums.map((n) => (
            <div
              key={n}
              className={`w-7 h-7 rounded text-xs flex items-center justify-center font-bold ${
                r.hits.includes(n) ? "bg-yellow-500 text-slate-900" : "bg-slate-700 text-slate-400"
              }`}
            >
              {n}
            </div>
          ))}
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
  const [mineCount, setMineCount] = useState(3);
  const [limboTarget, setLimboTarget] = useState<number | "">(2);
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
          mineCount,
        });
        spinResults.push({ nonce: n, game: selectedGame, result });
      }
      setResults(spinResults);
    } finally {
      setLoading(false);
    }
  }, [serverSeed, clientSeed, nonceStart, nonceCount, selectedGame, wheelSegments, wheelRisk, plinkoRows, mineCount]);

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
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
              <h2 className="font-semibold text-slate-200">{t.gameSelect}</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GAMES).map(([key, g]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedGame(key as GameType)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      selectedGame === key
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">{GAMES[selectedGame].description}</p>
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
                      onChange={(e) => setNonceCount(Math.min(200, Math.max(1, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={200}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Game-specific options + Calculate */}
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
                )}

                {selectedGame === "mines" && (
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">{t.mineCount}</label>
                    <input
                      type="number"
                      value={mineCount}
                      onChange={(e) => setMineCount(Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={24}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {selectedGame === "limbo" && (
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">{t.limboTarget}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={limboTarget}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") setLimboTarget("");
                          else setLimboTarget(Math.max(1.01, parseFloat(v) || 1.01));
                        }}
                        min={1.01}
                        step={0.01}
                        placeholder={t.limboTargetPlaceholder}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-400 text-sm shrink-0">{t.limboTargetSuffix}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t.limboTargetHint}</p>
                  </div>
                )}

                {!["wheel", "plinko", "mines", "limbo"].includes(selectedGame) && (
                  <p className="text-sm text-slate-500 flex-1">{t.noExtraOptions}</p>
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

            {results.length > 0 && (() => {
              const isLimboFiltered = selectedGame === "limbo" && limboTarget !== "";
              const target = typeof limboTarget === "number" ? limboTarget : 0;
              const hits = isLimboFiltered
                ? results.filter((s) => s.result.type === "limbo" && (s.result as LimboResult).multiplier >= target)
                : [];

              return (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-semibold text-slate-200">
                      {t.resultsTitle} ({results.length} {t.spins})
                    </h2>
                    <div className="flex items-center gap-3">
                      {isLimboFiltered && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">
                            <span className="font-bold text-yellow-400">{target}x</span> {t.andAbove}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${hits.length > 0 ? "bg-emerald-700 text-emerald-200" : "bg-slate-700 text-slate-400"}`}>
                            {hits.length} / {results.length} {t.hits}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-slate-400">
                        {GAMES[selectedGame].name} · Nonce {results[0].nonce} - {results[results.length - 1].nonce}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {results.map((spin) => {
                      const isHit = isLimboFiltered && spin.result.type === "limbo" && (spin.result as LimboResult).multiplier >= target;
                      const isMiss = isLimboFiltered && !isHit;
                      return (
                        <div
                          key={spin.nonce}
                          className={`px-4 py-3 flex items-start gap-4 transition-colors ${
                            isHit ? "bg-emerald-900/30 border-l-2 border-emerald-500" : isMiss ? "opacity-40" : ""
                          }`}
                        >
                          <div className="shrink-0 w-16">
                            <div className="text-xs text-slate-500">{t.nonce}</div>
                            <div className={`font-mono font-bold ${isHit ? "text-emerald-300" : "text-slate-300"}`}>{spin.nonce}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <ResultDisplay result={spin.result} t={t} />
                          </div>
                          {isHit && (
                            <div className="shrink-0">
                              <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">{t.hitBadge}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {results.length === 0 && !loading && (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-3">🎲</div>
                <p className="text-lg font-medium">{t.noResults}</p>
                <p className="text-sm mt-1">{t.noResultsHint}</p>
              </div>
            )}
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
