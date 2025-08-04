export interface TangoSolution {
  grid: string[][];
}

export interface QueenPosition {
  row: number;
  col: number;
}

export interface GridColor {
  color: number;
}

export interface QueensSolution {
  queenPositions: QueenPosition[];
  gridSize: number;  
  gridColors: GridColor[];
}

export interface CrossclimbCard {
  initialIndex: number;
  solutionIndex: number;
  answer: string;
}

export interface CrossclimbSolution extends Array<CrossclimbCard> {}

export interface PinpointClue {
  clue: string;
}

export interface PinpointSolution {
  clues: PinpointClue[];
  acceptableAnswers: string[];
}

export interface ZipWall {
  cellIdx: number;
  direction: string;
}

export interface ZipSolution {
  numbers: number[];
  solution: number[];
  walls: ZipWall[];
  gridSize: number;
}

export interface CustomEventDetail {
  tangoSolution?: TangoSolution;
  queensSolution?: QueensSolution;
  crossclimbSolution?: CrossclimbSolution;
  pinpointSolution?: PinpointSolution;
  zipSolution?: ZipSolution;
}

// Global custom event interface is already defined by DOM types