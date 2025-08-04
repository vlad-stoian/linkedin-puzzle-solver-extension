import { debug } from '@/utils/debug';

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  matchAboutBlank: true,
  allFrames: true,
  world: "MAIN",
  main() {

    window.navigation?.addEventListener("navigate", (event: NavigateEvent) => {
      debug.log("Navigation event detected:", event);

      const observer = new MutationObserver(() => {
        if (document.querySelector('.pr-game-web__main-container')) {
          debug.log("Game main container found, disconnecting observer.");
          observer.disconnect();
          checkParseAndSendSolution();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    })

    window.addEventListener('message', function (event) {
      // console.log('Received message:', event);

      if (!(event.data && event.data.type === 'PassClientScriptReady')) {
        return;
      }

      checkParseAndSendSolution();
    });
  },
});


function checkParseAndSendSolution() {
  let Ember = loadEmber();
  if (!Ember) {
    debug.error('Ember is not loaded.');
    return;
  }

  debug.log('Ember', Ember);
  window.Ember = Ember;

  let Application = getApplication(Ember)
  if (!Application) {
    debug.error('No Ember application found.');
    return;
  }
  debug.log('Ember Application:', Application);
  window.Application = Application;

  let nodes = Ember._captureRenderTree(Application.__deprecatedInstance__);
  if (!nodes) {
    debug.error('No render tree nodes found.');
    return;
  }

  let flattenedNodes = flattenNodes(nodes);
  for (const node of flattenedNodes) {
    console.log('Ember node:', node);
    console.log(node.template, node.instance, node.args);
  }

  let gameType = flattenedNodes.find((node: { name: string; }) => node.name === 'play-routes@game-play')?.args?.named?.gameType;
  debug.log('Game type:', gameType);

  switch (gameType) {
    case 'lotka':
      debug.log('Detected Tango game type.');
      let tangoSolution = extractTangoSolution(flattenedNodes);
      debug.log('Tango solution:', tangoSolution);

      window.dispatchEvent(new CustomEvent("MagicalNarwhal", { detail: { tangoSolution } }));
      break;
    case 'crossclimb':
      debug.log('Detected Crossclimb game type.');
      let crossclimbSolution = extractCrossclimbSolution(flattenedNodes);
      debug.log('Crossclimb solution:', crossclimbSolution);
      window.dispatchEvent(new CustomEvent("MagicalNarwhal", { detail: { crossclimbSolution } }));
      break;
    case 'pinpoint':
      debug.log('Detected Pinpoint game type.');
      let pinpointSolution = extractPinpointSolution(flattenedNodes);
      debug.log('Pinpoint solution:', pinpointSolution);
      window.dispatchEvent(new CustomEvent("MagicalNarwhal", { detail: { pinpointSolution } }));
      break;
    case 'queensv2':
      debug.log('Detected Queens game type.');
      let queensSolution = extractQueensSolution(flattenedNodes);
      debug.log('Queens solution:', queensSolution);
      window.dispatchEvent(new CustomEvent("MagicalNarwhal", { detail: { queensSolution } }));
      break;
    case 'trail':
      debug.log('Detected Zip game type.');
      let zipSolution = extractZipSolution(flattenedNodes);
      debug.log('Zip solution:', zipSolution);
      window.dispatchEvent(new CustomEvent("MagicalNarwhal", { detail: { zipSolution } }));
      break;
    default:
      debug.warn('Unsupported game type:', gameType);
      break;
  }
}


function flattenNodes(nodes: any[]) {
  // Use reduce to build up the new flat array
  return nodes.reduce((acc, node) => {
    // Separate the children from the rest of the node's properties
    const { children, ...nodeWithoutChildren } = node;

    // Add the current node to our accumulator
    acc.push(nodeWithoutChildren);

    // If there are children, recursively flatten them and add them too
    if (children && children.length > 0) {
      acc = acc.concat(flattenNodes(children));
    }

    return acc;
  }, []);
}



function loadEmber(): any {
  let Ember;

  try {
    Ember = window.requireModule?.('ember')?.default
      || window.require?.('ember')?.default
      || window.Ember;
  } catch {
    Ember = window.Ember;
  }

  return Ember;
}

function getApplication(Ember: any): any {
  let namespaces = Ember.Namespace.NAMESPACES;
  let application;

  namespaces.forEach((namespace: any) => {
    if (namespace instanceof Ember.Application) {
      application = namespace;
      return false;
    }
  });
  return application;
}
function extractTangoSolution(nodes: any[]): { [key: string]: any } {
  const solution = Array.from({ length: 6 }, () => Array(6).fill(0));
  for (const node of nodes) {
    if (node.template === 'games-web/components/private/lotka/game-cell.gts') {
      solution[node.instance.row][node.instance.col] = node.args.named.cellData.solution;
    }
  }
  return { grid: solution };
}

function extractCrossclimbSolution(nodes: any[]): { [key: string]: any } {
  const solution = [];
  for (const node of nodes) {
    if (node.template === 'games-web/components/private/crossclimb/crossclimb-guess.gjs' && node.args.named.card) {
      solution.push(node.args.named.card);
    }
  }
  return solution;
}


function extractPinpointSolution(nodes: any[]): { [key: string]: any } {
  let solution: any = {};
  let clues = []
  let acceptableAnswers = [];
  for (const node of nodes) {
    if (node.template === 'games-web/components/private/pinpoint/board-section.gts') {
      debug.log('Pinpoint board section found:', node);
      clues.push(node.args.named.staticCard);
    }

    if (node.template === 'games-web/components/private/pinpoint/input-section.gts') {
      debug.log('Pinpoint input section found:', node);

      for (const card of node.args.named.gameState.acceptableAnswers) {
        acceptableAnswers.push(card);
      }
    }
  }

  solution['clues'] = clues;
  solution['acceptableAnswers'] = acceptableAnswers;
  return solution;
}

function extractQueensSolution(nodes: any[]): { [key: string]: any } {
  let queenPositions: any[] = [];
  let gridSize = 0;
  let gridColors: any[] = [];


  for (const node of nodes) {
    if (node.template === 'games-web/components/private/queens/game-board.gjs') {
      debug.log('Queens game board section found:', node);
      for (const position of node.args.named.gameData.solution.value) {
        queenPositions.push({ row: position.row, col: position.col });
      }
      gridSize = node.args.named.gameData.gridSize;
      gridColors = node.args.named.gameData.cells;
    }
  }
  return {
    queenPositions: queenPositions,
    gridSize: gridSize,
    gridColors: gridColors
  };
}





function extractZipSolution(nodes: any[]): { [key: string]: any } {
  let zipSolution: any = {};
  let numbers = [];
  let solution = [];
  let walls = [];
  let gridSize = 0;

  // for (const node of nodes) {
  //   if (hasSolutionFieldIterative(node)) {
  //     console.log('Zip solution field found:', node);
  //     console.log('Solution path:', findSolutionPath(node));
  //   }
  // }

  for (const node of nodes) {
    if (node.template === 'games-web/components/private/trail/game-board.gts') {
      debug.log('Zip game board section found:', node);
      let cache = node.instance.args.gameState.trailGamePuzzle._cache

      for (const position of cache.orderedSequence) {
        numbers.push(position);
      }

      for (const position of cache.solution) {
        solution.push(position);
      }

      for (const wall of cache.walls) {
        walls.push(wall._cache);
      }

      gridSize = cache.gridSize;
    }
  }

  zipSolution['numbers'] = numbers;
  zipSolution['solution'] = solution;
  zipSolution['walls'] = walls;
  zipSolution['gridSize'] = gridSize;

  return zipSolution;
}


// games-web​/​components​/​private​/​trail​/​game-board.gts
// .segment.cells
// args.named.orderedSequence -> positions of the numbers
