export type GameType =
  | "dice"
  | "limbo"
  | "wheel"
  | "roulette"
  | "diamonds"
  | "plinko"
  | "mines"
  | "keno"
  | "blackjack"
  | "hilo"
  | "baccarat"
  | "video-poker"
  | "crash"
  | "flip"
  | "snakes"
  | "rock-paper-scissors"
  | "chicken"
  | "pump";

export interface GameConfig {
  name: string;
  cursors: number | "unlimited";
  description: string;
}

export const GAMES: Record<GameType, GameConfig> = {
  dice: { name: "Dice", cursors: 1, description: "0.00 - 100.00 arası zar atışı" },
  limbo: { name: "Limbo", cursors: 1, description: "Çarpan olarak crash noktası" },
  wheel: { name: "Wheel", cursors: 1, description: "Çark çevirme" },
  roulette: { name: "Roulette", cursors: 1, description: "0-36 arası rulet" },
  diamonds: { name: "Diamonds", cursors: 1, description: "5 mücevher" },
  plinko: { name: "Plinko", cursors: 2, description: "8-16 pin arasında top yolu" },
  mines: { name: "Mines", cursors: 3, description: "24 mayın konumu" },
  keno: { name: "Keno", cursors: 2, description: "10 keno vuruşu" },
  blackjack: { name: "Blackjack", cursors: "unlimited", description: "Kart destesi" },
  hilo: { name: "Hilo", cursors: "unlimited", description: "Kart destesi" },
  baccarat: { name: "Baccarat", cursors: 1, description: "6 kart" },
  "video-poker": { name: "Video Poker", cursors: 7, description: "52 kartlı deste" },
  crash: { name: "Crash", cursors: 1, description: "Crash noktası" },
  flip: { name: "Flip", cursors: 3, description: "20 yazı-tura atışı" },
  snakes: { name: "Snakes & Ladders", cursors: 2, description: "10 zar atışı" },
  "rock-paper-scissors": { name: "Rock Paper Scissors", cursors: "unlimited", description: "Taş-kağıt-makas" },
  chicken: { name: "Chicken", cursors: 3, description: "20 ölüm şansı" },
  pump: { name: "Pump", cursors: 3, description: "24 patlama şansı" },
};

const CARDS = [
  "♦2","♥2","♠2","♣2","♦3","♥3","♠3","♣3","♦4","♥4",
  "♠4","♣4","♦5","♥5","♠5","♣5","♦6","♥6","♠6","♣6",
  "♦7","♥7","♠7","♣7","♦8","♥8","♠8","♣8","♦9","♥9",
  "♠9","♣9","♦10","♥10","♠10","♣10","♦J","♥J","♠J",
  "♣J","♦Q","♥Q","♠Q","♣Q","♦K","♥K","♠K","♣K","♦A",
  "♥A","♠A","♣A",
];

const GEMS = ["Yeşil","Mor","Sarı","Kırmızı","Cyan","Pembe","Mavi"];

const WHEEL_PAYOUTS: Record<string, Record<string, number[]>> = {
  "10": {
    low: [1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0],
    medium: [0,1.9,0,1.5,0,2,0,1.5,0,3],
    high: [0,0,0,0,0,0,0,0,0,9.9],
  },
  "20": {
    low: [1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0],
    medium: [1.5,0,2,0,2,0,2,0,1.5,0,3,0,1.8,0,2,0,2,0,2,0],
    high: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19.8],
  },
  "30": {
    low: [1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0],
    medium: [1.5,0,1.5,0,2,0,1.5,0,2,0,2,0,1.5,0,3,0,1.5,0,2,0,2,0,1.7,0,4,0,1.5,0,2,0],
    high: Array(29).fill(0).concat([29.7]),
  },
  "40": {
    low: [1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0],
    medium: [1.5,0,2,0,1.5,0,2,0,1.5,0,2,0,3,0,1.5,0,2,0,2,0,1.5,0,2,0,1.5,0,3,0,2,0,1.5,0,2,0,1.5,0,2,0,2,0],
    high: Array(39).fill(0).concat([39.6]),
  },
  "50": {
    low: [1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0,1.5,1.2,1.2,1.2,0,1.2,1.2,1.2,1.2,0],
    medium: [1.5,0,1.7,0,2,0,1.5,0,1.5,0,2,0,1.7,0,3,0,1.5,0,2,0,1.7,0,1.5,0,2,0,1.7,0,3,0,1.5,0,2,0,1.5,0,1.7,0,2,0,1.5,0,1.7,0,5,0,1.5,0,2,0],
    high: Array(49).fill(0).concat([49.5]),
  },
};

export async function hmacSha256(serverSeed: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(serverSeed),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

export async function* byteGenerator(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cursor: number = 0
): AsyncGenerator<number> {
  let currentRound = Math.floor(cursor / 32);
  let currentRoundCursor = cursor - currentRound * 32;

  while (true) {
    const buffer = await hmacSha256(serverSeed, `${clientSeed}:${nonce}:${currentRound}`);
    while (currentRoundCursor < 32) {
      yield buffer[currentRoundCursor];
      currentRoundCursor++;
    }
    currentRoundCursor = 0;
    currentRound++;
  }
}

export async function generateFloats(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cursor: number,
  count: number
): Promise<number[]> {
  const rng = byteGenerator(serverSeed, clientSeed, nonce, cursor);
  const bytes: number[] = [];

  while (bytes.length < count * 4) {
    const next = await rng.next();
    bytes.push(next.value as number);
  }

  const chunks: number[][] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    chunks.push(bytes.slice(i, i + 4));
  }

  return chunks.map((chunk) =>
    chunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1);
      return result + value / divider;
    }, 0)
  );
}

function fisherYatesShuffle<T>(deck: T[], floats: number[]): T[] {
  const arr = [...deck];
  for (let i = 0; i < floats.length; i++) {
    const j = i + Math.floor(floats[i] * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface SpinResult {
  nonce: number;
  game: GameType;
  result: GameResultData;
}

export type GameResultData =
  | DiceResult
  | LimboResult
  | WheelResult
  | RouletteResult
  | DiamondsResult
  | PlinkoResult
  | MinesResult
  | KenoResult
  | CardsResult
  | VideoPokerResult
  | CrashResult
  | FlipResult
  | SnakesResult
  | RockPaperScissorsResult
  | ChickenResult
  | PumpResult;

export interface DiceResult { type: "dice"; roll: number }
export interface LimboResult { type: "limbo"; multiplier: number }
export interface WheelResult { type: "wheel"; payout: number; segment: number }
export interface RouletteResult { type: "roulette"; pocket: number }
export interface DiamondsResult { type: "diamonds"; gems: string[] }
export interface PlinkoResult { type: "plinko"; path: string[]; slot: number }
export interface MinesResult { type: "mines"; mines: number[] }
export interface KenoResult { type: "keno"; hits: number[] }
export interface CardsResult { type: "cards"; cards: string[]; game: string }
export interface VideoPokerResult { type: "video-poker"; cards: string[] }
export interface CrashResult { type: "crash"; multiplier: number }
export interface FlipResult { type: "flip"; flips: string[] }
export interface SnakesResult { type: "snakes"; rolls: number[] }
export interface RockPaperScissorsResult { type: "rock-paper-scissors"; choices: string[] }
export interface ChickenResult { type: "chicken"; deaths: number[] }
export interface PumpResult { type: "pump"; pops: number[] }

export async function calculateGameResult(
  game: GameType,
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  options?: { wheelSegments?: string; wheelRisk?: string; plinkoRows?: number; mineCount?: number }
): Promise<GameResultData> {
  switch (game) {
    case "dice": {
      const [f] = await generateFloats(serverSeed, clientSeed, nonce, 0, 1);
      return { type: "dice", roll: Math.floor(f * 10001) / 100 };
    }
    case "limbo": {
      const [f] = await generateFloats(serverSeed, clientSeed, nonce, 0, 1);
      const floatPoint = 1e8 / (f * 1e8) * 0.99;
      const crashPoint = Math.floor(floatPoint * 100) / 100;
      return { type: "limbo", multiplier: Math.max(crashPoint, 1) };
    }
    case "crash": {
      const [f] = await generateFloats(serverSeed, clientSeed, nonce, 0, 1);
      const multiplier = f < 0.02 ? 1 : Math.min(0.98 / (1 - f), 2000000);
      return { type: "crash", multiplier: Math.floor(multiplier * 100) / 100 };
    }
    case "wheel": {
      const segments = options?.wheelSegments || "10";
      const risk = options?.wheelRisk || "medium";
      const payouts = WHEEL_PAYOUTS[segments]?.[risk] || WHEEL_PAYOUTS["10"]["medium"];
      const [f] = await generateFloats(serverSeed, clientSeed, nonce, 0, 1);
      const segment = Math.floor(f * payouts.length);
      return { type: "wheel", payout: payouts[segment], segment };
    }
    case "roulette": {
      const [f] = await generateFloats(serverSeed, clientSeed, nonce, 0, 1);
      return { type: "roulette", pocket: Math.floor(f * 37) };
    }
    case "diamonds": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 5);
      const gems = floats.map((f) => GEMS[Math.floor(f * 7)]);
      return { type: "diamonds", gems };
    }
    case "plinko": {
      const rows = options?.plinkoRows || 16;
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, rows);
      const path = floats.map((f) => (Math.floor(f * 2) === 0 ? "L" : "R"));
      const slot = path.filter((d) => d === "R").length;
      return { type: "plinko", path, slot };
    }
    case "mines": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 24);
      const positions = Array.from({ length: 25 }, (_, i) => i);
      const shuffled = fisherYatesShuffle(positions, floats);
      const mineCount = options?.mineCount || 1;
      return { type: "mines", mines: shuffled.slice(0, mineCount) };
    }
    case "pump": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 24);
      const positions = Array.from({ length: 24 }, (_, i) => i);
      const shuffled = fisherYatesShuffle(positions, floats);
      return { type: "pump", pops: shuffled };
    }
    case "chicken": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 20);
      const positions = Array.from({ length: 20 }, (_, i) => i);
      const shuffled = fisherYatesShuffle(positions, floats);
      return { type: "chicken", deaths: shuffled };
    }
    case "keno": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 10);
      const positions = Array.from({ length: 40 }, (_, i) => i + 1);
      const hits: number[] = [];
      const remaining = [...positions];
      for (const f of floats) {
        const index = Math.floor(f * remaining.length);
        hits.push(remaining[index]);
        remaining.splice(index, 1);
      }
      return { type: "keno", hits };
    }
    case "blackjack":
    case "hilo": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 52);
      const shuffled = fisherYatesShuffle([...CARDS], floats);
      return { type: "cards", cards: shuffled.slice(0, 10), game };
    }
    case "baccarat": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 52);
      const shuffled = fisherYatesShuffle([...CARDS], floats);
      return { type: "cards", cards: shuffled.slice(0, 6), game: "baccarat" };
    }
    case "video-poker": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 52);
      const shuffled = fisherYatesShuffle([...CARDS], floats);
      return { type: "video-poker", cards: shuffled.slice(0, 5) };
    }
    case "flip": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 20);
      const flips = floats.map((f) => (f <= 0.5 ? "Yazı" : "Tura"));
      return { type: "flip", flips };
    }
    case "snakes": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 10);
      const rolls = floats.map((f) => Math.floor(f * 6) + 1);
      return { type: "snakes", rolls };
    }
    case "rock-paper-scissors": {
      const floats = await generateFloats(serverSeed, clientSeed, nonce, 0, 10);
      const choices = floats.map((f) => {
        const idx = Math.floor(f * 3);
        return ["Taş", "Kağıt", "Makas"][idx];
      });
      return { type: "rock-paper-scissors", choices };
    }
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
