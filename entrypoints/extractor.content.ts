import { debug } from '@/utils/debug';
import {
  extractionManager,
  flattenNodes,
  validateEmberEnvironment,
  type EmberNode
} from '@/utils/extractor-core';
import { LINKEDIN_GAMES_MATCHES } from '@/utils/urls';

export default defineContentScript({
  matches: LINKEDIN_GAMES_MATCHES,
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
      if (!(event.data && event.data.type === 'PassClientScriptReady')) {
        return;
      }

      checkParseAndSendSolution();
    });
  },
});


async function checkParseAndSendSolution(): Promise<void> {
  const startTime = performance.now();

  try {
    // Validate environment
    const envCheck = validateEmberEnvironment();
    if (!envCheck.valid) {
      debug.error('Environment validation failed:', envCheck.error);
      return;
    }

    // Load Ember with retries
    const Ember = await loadEmberWithRetry(3);
    if (!Ember) {
      debug.error('Failed to load Ember after retries');
      return;
    }

    debug.log('Ember loaded successfully');
    window.Ember = Ember;

    // Get application with timeout
    const Application = await getApplicationWithTimeout(Ember, 5000);
    if (!Application) {
      debug.error('Failed to get Ember application');
      return;
    }

    debug.log('Ember Application found');
    window.Application = Application;

    // Capture render tree
    const nodes = Ember._captureRenderTree?.(Application.__deprecatedInstance__);
    if (!nodes || !Array.isArray(nodes)) {
      debug.error('Failed to capture render tree');
      return;
    }

    debug.log(`Captured ${nodes.length} root nodes`);

    // Flatten nodes efficiently
    const flattenedNodes = flattenNodes(nodes as EmberNode[]);
    debug.log(`Flattened to ${flattenedNodes.length} total nodes`);

    // Log detailed node information only in debug mode
    if (debug.isEnabled) {
      const sampleSize = Math.min(5, flattenedNodes.length);
      debug.log(`Sampling first ${sampleSize} nodes:`);
      for (let i = 0; i < sampleSize; i++) {
        const node = flattenedNodes[i];
        debug.log(`Node ${i}:`, {
          name: node.name,
          template: node.template,
          hasInstance: !!node.instance,
          hasArgs: !!node.args
        });
      }
    }

    // Detect game type
    const detection = extractionManager.detectGameType(flattenedNodes);

    if (!detection.gameType) {
      debug.warn('Could not detect game type');
      return;
    }

    if (detection.confidence < 0.5) {
      debug.warn(`Low confidence game detection: ${detection.gameType} (${detection.confidence.toFixed(2)})`);
    }

    // Extract solution
    const extraction = extractionManager.extractSolution(detection.gameType, flattenedNodes);

    if (!extraction.success) {
      debug.error(`Extraction failed for ${detection.gameType}:`, extraction.error);
      return;
    }

    // Create and dispatch event
    const eventDetail = extractionManager.createEventDetail(detection.gameType, extraction.data);
    const event = new CustomEvent('MagicalNarwhal', { detail: eventDetail });

    window.dispatchEvent(event);

    const totalTime = performance.now() - startTime;
    debug.log(`Successfully extracted and dispatched ${detection.gameType} solution (${totalTime.toFixed(2)}ms total)`);

  } catch (error) {
    const totalTime = performance.now() - startTime;
    debug.error(`Fatal error in solution extraction (${totalTime.toFixed(2)}ms):`, error);
  }
}


// ============================================================================
// OPTIMIZED EMBER UTILITIES
// ============================================================================

async function loadEmberWithRetry(maxRetries: number): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const Ember = window.requireModule?.('ember')?.default
        || window.require?.('ember')?.default
        || window.Ember;

      if (Ember) {
        debug.log(`Ember loaded on attempt ${attempt}`);
        return Ember;
      }
    } catch (error) {
      debug.warn(`Ember load attempt ${attempt} failed:`, error);
    }

    if (attempt < maxRetries) {
      // Exponential backoff
      const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
      debug.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return null;
}

async function getApplicationWithTimeout(Ember: any, timeoutMs: number): Promise<any> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      debug.warn(`Application search timed out after ${timeoutMs}ms`);
      resolve(null);
    }, timeoutMs);

    try {
      const namespaces = Ember?.Namespace?.NAMESPACES;
      if (!Array.isArray(namespaces)) {
        clearTimeout(timeout);
        resolve(null);
        return;
      }

      for (const namespace of namespaces) {
        if (namespace instanceof Ember.Application) {
          clearTimeout(timeout);
          resolve(namespace);
          return;
        }
      }

      clearTimeout(timeout);
      resolve(null);
    } catch (error) {
      clearTimeout(timeout);
      debug.error('Error while searching for application:', error);
      resolve(null);
    }
  });
}
