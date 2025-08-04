import { debug } from '@/utils/debug';
import { LINKEDIN_GAMES_MATCHES } from '@/utils/urls';

export default defineContentScript({
  matches: LINKEDIN_GAMES_MATCHES,
  runAt: "document_start",
  matchAboutBlank: true,
  allFrames: true,
  world: "MAIN",
  main() {
    debug.log('Boot script running.');
    if (document.contentType === 'text/html') {
      debug.log('Setting Ember environment for debugging.');
      window.EmberENV = { _DEBUG_RENDER_TREE: true };
    }
  }
});

declare global {
  interface Window {
    EmberENV: any;
  }
}
