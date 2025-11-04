export type LineValue = 6 | 7 | 8 | 9;

export interface Line {
  value: LineValue;
  isChanging: boolean;
}

export interface TrigramData {
  name: string;
  russianName: string;
  image: string;
  symbol: string;
  lines: (0 | 1)[];
}

export interface HexagramData {
  number: number;
  name: string;
  russianName: string;
  lines: (0 | 1)[];
  upperTrigram: string;
  lowerTrigram: string;
}

export interface DivinationResult {
  primaryHexagram: {
    name: string;
    judgment: string;
    image: string;
  };
  changingLines: {
    line: number;
    text: string;
  }[];
  secondaryHexagram: {
    name: string;
    judgment: string;
  };
  summary: string;
}