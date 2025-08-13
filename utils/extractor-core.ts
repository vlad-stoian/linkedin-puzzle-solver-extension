/**
 * Core extraction utilities and types for the LinkedIn Puzzle Solver
 * Optimized for performance, type safety, and maintainability
 */

import { debug } from '@/utils/debug';
import type {
  TangoSolution,
  CrossclimbSolution,
  PinpointSolution,
  QueensSolution,
  ZipSolution,
  SudokuSolution,
  CustomEventDetail
} from '@/types/solutions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EmberNode {
  name?: string;
  template?: string;
  instance?: any;
  args?: {
    named?: any;
  };
  children?: EmberNode[];
}

export interface GameDetectionResult {
  gameType: GameType | null;
  confidence: number;
  metadata?: Record<string, any>;
}

export type GameType = 'lotka' | 'crossclimb' | 'pinpoint' | 'queensv2' | 'trail' | 'sudoku';

export interface ExtractionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    nodeCount: number;
    extractionTimeMs: number;
    gameType: GameType;
  };
}

// ============================================================================
// GAME EXTRACTION STRATEGIES
// ============================================================================

export abstract class GameExtractor<T = any> {
  abstract readonly gameType: GameType;
  abstract readonly supportedTemplates: string[];

  abstract extract(nodes: EmberNode[]): ExtractionResult<T>;

  protected validateResult(data: any): boolean {
    return data !== null && data !== undefined;
  }
}

export class TangoExtractor extends GameExtractor<TangoSolution> {
  readonly gameType = 'lotka' as const;
  readonly supportedTemplates = ['games-web/components/private/lotka/game-cell.gts'];

  extract(nodes: EmberNode[]): ExtractionResult<TangoSolution> {
    const startTime = performance.now();

    try {
      const solution = Array.from({ length: 6 }, () => Array(6).fill(0));
      let cellCount = 0;

      for (const node of nodes) {
        if (this.supportedTemplates.includes(node.template || '')) {
          const { row, col } = node.instance || {};
          const cellValue = node.args?.named?.cellData?.solution;

          if (this.isValidPosition(row, col) && cellValue !== undefined) {
            solution[row][col] = cellValue;
            cellCount++;
          }
        }
      }

      const result: TangoSolution = { grid: solution };
      const extractionTime = performance.now() - startTime;

      if (cellCount === 0) {
        return {
          success: false,
          error: 'No valid Tango cells found',
          metadata: { nodeCount: nodes.length, extractionTimeMs: extractionTime, gameType: this.gameType }
        };
      }

      return {
        success: true,
        data: result,
        metadata: { nodeCount: cellCount, extractionTimeMs: extractionTime, gameType: this.gameType }
      };
    } catch (error) {
      return {
        success: false,
        error: `Tango extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { nodeCount: nodes.length, extractionTimeMs: performance.now() - startTime, gameType: this.gameType }
      };
    }
  }

  private isValidPosition(row: number, col: number): boolean {
    return typeof row === 'number' && typeof col === 'number' &&
      row >= 0 && row < 6 && col >= 0 && col < 6;
  }
}

export class CrossclimbExtractor extends GameExtractor<CrossclimbSolution> {
  readonly gameType = 'crossclimb' as const;
  readonly supportedTemplates = ['games-web/components/private/crossclimb/crossclimb-guess.gjs'];

  extract(nodes: EmberNode[]): ExtractionResult<CrossclimbSolution> {
    const startTime = performance.now();

    try {
      const solution: CrossclimbSolution = [];

      for (const node of nodes) {
        if (this.supportedTemplates.includes(node.template || '') && node.args?.named?.card) {
          const card = node.args.named.card;
          if (this.isValidCard(card)) {
            solution.push(card);
          }
        }
      }

      const extractionTime = performance.now() - startTime;

      if (solution.length === 0) {
        return {
          success: false,
          error: 'No valid Crossclimb cards found',
          metadata: { nodeCount: nodes.length, extractionTimeMs: extractionTime, gameType: this.gameType }
        };
      }

      return {
        success: true,
        data: solution,
        metadata: { nodeCount: solution.length, extractionTimeMs: extractionTime, gameType: this.gameType }
      };
    } catch (error) {
      return {
        success: false,
        error: `Crossclimb extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { nodeCount: nodes.length, extractionTimeMs: performance.now() - startTime, gameType: this.gameType }
      };
    }
  }

  private isValidCard(card: any): boolean {
    return card &&
      typeof card.initialIndex === 'number' &&
      typeof card.solutionIndex === 'number' &&
      typeof card.answer === 'string';
  }
}

export class PinpointExtractor extends GameExtractor<PinpointSolution> {
  readonly gameType = 'pinpoint' as const;
  readonly supportedTemplates = [
    'games-web/components/private/pinpoint/board-section.gts',
    'games-web/components/private/pinpoint/input-section.gts'
  ];

  extract(nodes: EmberNode[]): ExtractionResult<PinpointSolution> {
    const startTime = performance.now();

    try {
      const clues: any[] = [];
      const acceptableAnswers: string[] = [];

      for (const node of nodes) {
        if (node.template === 'games-web/components/private/pinpoint/board-section.gts') {
          const staticCard = node.args?.named?.staticCard;
          if (staticCard) {
            clues.push({
              clue: staticCard.clue,
              position: staticCard.position
            });
          }
        } else if (node.template === 'games-web/components/private/pinpoint/input-section.gts') {
          const answers = node.args?.named?.gameState?.acceptableAnswers;
          if (Array.isArray(answers)) {
            acceptableAnswers.push(...answers.filter(answer => typeof answer === 'string'));
          }
        }
      }

      const result: PinpointSolution = { clues, acceptableAnswers };
      const extractionTime = performance.now() - startTime;

      if (clues.length === 0 && acceptableAnswers.length === 0) {
        return {
          success: false,
          error: 'No valid Pinpoint data found',
          metadata: { nodeCount: nodes.length, extractionTimeMs: extractionTime, gameType: this.gameType }
        };
      }

      return {
        success: true,
        data: result,
        metadata: { nodeCount: clues.length + acceptableAnswers.length, extractionTimeMs: extractionTime, gameType: this.gameType }
      };
    } catch (error) {
      return {
        success: false,
        error: `Pinpoint extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { nodeCount: nodes.length, extractionTimeMs: performance.now() - startTime, gameType: this.gameType }
      };
    }
  }
}

export class QueensExtractor extends GameExtractor<QueensSolution> {
  readonly gameType = 'queensv2' as const;
  readonly supportedTemplates = ['games-web/components/private/queens/game-board.gjs'];

  extract(nodes: EmberNode[]): ExtractionResult<QueensSolution> {
    const startTime = performance.now();

    try {
      let queenPositions: any[] = [];
      let gridSize = 0;
      let gridColors: any[] = [];

      for (const node of nodes) {
        if (this.supportedTemplates.includes(node.template || '')) {
          const gameData = node.args?.named?.gameData;
          if (gameData) {
            const solution = gameData.solution?.value;
            if (Array.isArray(solution)) {
              queenPositions = solution.map(pos => ({ row: pos.row, col: pos.col }));
            }

            gridSize = gameData.gridSize || 0;
            gridColors = gameData.cells || [];
            break; // Early termination - we found the game board
          }
        }
      }

      const result: QueensSolution = { queenPositions, gridSize, gridColors };
      const extractionTime = performance.now() - startTime;

      if (queenPositions.length === 0 && gridSize === 0) {
        return {
          success: false,
          error: 'No valid Queens data found',
          metadata: { nodeCount: nodes.length, extractionTimeMs: extractionTime, gameType: this.gameType }
        };
      }

      return {
        success: true,
        data: result,
        metadata: { nodeCount: queenPositions.length, extractionTimeMs: extractionTime, gameType: this.gameType }
      };
    } catch (error) {
      return {
        success: false,
        error: `Queens extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { nodeCount: nodes.length, extractionTimeMs: performance.now() - startTime, gameType: this.gameType }
      };
    }
  }
}

export class ZipExtractor extends GameExtractor<ZipSolution> {
  readonly gameType = 'trail' as const;
  readonly supportedTemplates = ['games-web/components/private/trail/game-board.gts'];

  extract(nodes: EmberNode[]): ExtractionResult<ZipSolution> {
    const startTime = performance.now();

    try {
      let numbers: number[] = [];
      let solution: number[] = [];
      let walls: any[] = [];
      let gridSize = 0;

      for (const node of nodes) {
        if (this.supportedTemplates.includes(node.template || '')) {
          const cache = node.instance?.args?.gameState?.trailGamePuzzle?._cache;
          if (cache) {
            numbers = Array.isArray(cache.orderedSequence) ? [...cache.orderedSequence] : [];
            solution = Array.isArray(cache.solution) ? [...cache.solution] : [];
            walls = Array.isArray(cache.walls) ? cache.walls.map((wall: any) => wall._cache) : [];
            gridSize = cache.gridSize || 0;
            break; // Early termination
          }
        }
      }

      const result: ZipSolution = { numbers, solution, walls, gridSize };
      const extractionTime = performance.now() - startTime;

      if (numbers.length === 0 && solution.length === 0 && gridSize === 0) {
        return {
          success: false,
          error: 'No valid Zip data found',
          metadata: { nodeCount: nodes.length, extractionTimeMs: extractionTime, gameType: this.gameType }
        };
      }

      return {
        success: true,
        data: result,
        metadata: { nodeCount: numbers.length + solution.length, extractionTimeMs: extractionTime, gameType: this.gameType }
      };
    } catch (error) {
      return {
        success: false,
        error: `Zip extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { nodeCount: nodes.length, extractionTimeMs: performance.now() - startTime, gameType: this.gameType }
      };
    }
  }
}

export class SudokuExtractor extends GameExtractor<SudokuSolution> {
  readonly gameType = 'sudoku' as const;
  readonly supportedTemplates = ['games-web/components/private/sudoku/game-board.gts'];

  extract(nodes: EmberNode[]): ExtractionResult<SudokuSolution> {
    const startTime = performance.now();

    try {
      let columns: number = 0;
      let rows: number = 0;
      let cells: {expectedValue: number, isPrefilled: boolean, positionIndex: number}[] = [];

      for (const node of nodes) {
        if (this.supportedTemplates.includes(node.template || '')) {
          debug.log('Sudoku game board found:', node);

          columns = node.args?.named?.column || 0;
          rows = node.args?.named?.row || 0;
          cells = node.args?.named?.gameState?.cells || [];
          break;
        }
      }

      debug.log(`Sudoku grid size: ${columns}x${rows}, cells found: ${cells.length}`);

      const gridSize = Math.max(columns, rows);
      const grid: (number | null)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

      for (const cell of cells) {
        const { expectedValue, positionIndex } = cell;
        if (typeof expectedValue === 'number' && typeof positionIndex === 'number') {
          const row = Math.floor(positionIndex / gridSize);
          const col = positionIndex % gridSize;
          if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            grid[row][col] = expectedValue;
          }
        }
      }

      const result: SudokuSolution = { grid, size: gridSize };
      const extractionTime = performance.now() - startTime;

      const filledCells = grid.flat().filter(cell => cell !== null).length;

      if (filledCells === 0) {
        return {
          success: false,
          error: 'No valid Sudoku data found',
          metadata: { nodeCount: nodes.length, extractionTimeMs: extractionTime, gameType: this.gameType }
        };
      }

      return {
        success: true,
        data: result,
        metadata: { nodeCount: filledCells, extractionTimeMs: extractionTime, gameType: this.gameType }
      };
    } catch (error) {
      return {
        success: false,
        error: `Sudoku extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { nodeCount: nodes.length, extractionTimeMs: performance.now() - startTime, gameType: this.gameType }
      };
    }
  }
}

// ============================================================================
// EXTRACTION MANAGER
// ============================================================================

export class ExtractionManager {
  private extractors = new Map<GameType, GameExtractor>([
    ['lotka', new TangoExtractor()],
    ['crossclimb', new CrossclimbExtractor()],
    ['pinpoint', new PinpointExtractor()],
    ['queensv2', new QueensExtractor()],
    ['trail', new ZipExtractor()],
    ['sudoku', new SudokuExtractor()],
  ]);

  detectGameType(nodes: EmberNode[]): GameDetectionResult {
    const startTime = performance.now();

    // Look for game type indicator node
    const gameTypeNode = nodes.find(node => node.name === 'play-routes@game-play');
    debug.log('Game type node:', gameTypeNode);
    const gameType = gameTypeNode?.args?.named?.gameType as GameType;

    if (gameType && this.extractors.has(gameType)) {
      debug.log(`Game type detected: ${gameType} (${performance.now() - startTime}ms)`);
      return {
        gameType,
        confidence: 1.0,
        metadata: { detectionTimeMs: performance.now() - startTime }
      };
    }

    // Fallback: analyze templates to infer game type
    const templateCounts = new Map<GameType, number>();

    for (const [type, extractor] of this.extractors) {
      const count = nodes.filter(node =>
        extractor.supportedTemplates.some(template => node.template === template)
      ).length;

      if (count > 0) {
        templateCounts.set(type, count);
      }
    }

    if (templateCounts.size === 0) {
      debug.warn('No game type could be detected from templates');
      return { gameType: null, confidence: 0 };
    }

    // Return the game type with the most template matches
    const [detectedType, count] = Array.from(templateCounts.entries())
      .reduce((max, current) => current[1] > max[1] ? current : max);

    const confidence = Math.min(count / 10, 1.0); // Normalize confidence

    debug.log(`Game type inferred from templates: ${detectedType} (confidence: ${confidence.toFixed(2)})`);

    return {
      gameType: detectedType,
      confidence,
      metadata: {
        detectionTimeMs: performance.now() - startTime,
        templateMatches: count,
        method: 'template-inference'
      }
    };
  }

  extractSolution(gameType: GameType, nodes: EmberNode[]): ExtractionResult {
    const extractor = this.extractors.get(gameType);

    if (!extractor) {
      return {
        success: false,
        error: `No extractor available for game type: ${gameType}`
      };
    }

    debug.log(`Extracting ${gameType} solution from ${nodes.length} nodes`);
    const result = extractor.extract(nodes);

    if (result.success) {
      debug.log(`Successfully extracted ${gameType} solution`, result.metadata);
    } else {
      debug.error(`Failed to extract ${gameType} solution:`, result.error);
    }

    return result;
  }

  createEventDetail(gameType: GameType, solution: any): CustomEventDetail {
    const detail: CustomEventDetail = {};

    switch (gameType) {
      case 'lotka':
        detail.tangoSolution = solution;
        break;
      case 'crossclimb':
        detail.crossclimbSolution = solution;
        break;
      case 'pinpoint':
        detail.pinpointSolution = solution;
        break;
      case 'queensv2':
        detail.queensSolution = solution;
        break;
      case 'trail':
        detail.zipSolution = solution;
        break;
      case 'sudoku':
        detail.sudokuSolution = solution;
        break;
    }

    return detail;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function flattenNodes(nodes: EmberNode[]): EmberNode[] {
  const result: EmberNode[] = [];
  const stack = [...nodes];

  while (stack.length > 0) {
    const node = stack.pop()!;
    const { children, ...nodeWithoutChildren } = node;

    result.push(nodeWithoutChildren);

    if (children && children.length > 0) {
      stack.push(...children);
    }
  }

  return result;
}

export function validateEmberEnvironment(): { valid: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { valid: false, error: 'Window object not available' };
  }

  if (!window.Ember && !window.requireModule && !window.require) {
    return { valid: false, error: 'Ember not found in any expected location' };
  }

  return { valid: true };
}

// Singleton instance
export const extractionManager = new ExtractionManager();
