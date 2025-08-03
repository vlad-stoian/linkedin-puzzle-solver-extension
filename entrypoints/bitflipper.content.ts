export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  matchAboutBlank: true,
  allFrames: true,
  world: "MAIN",
  main() {
    console.log('Boot script running.');
    if (document.contentType === 'text/html') {
      console.log('Setting Ember environment for debugging.');
      window.EmberENV = { _DEBUG_RENDER_TREE: true };
    }
  }
});

declare global {
  interface Window {
    EmberENV: any;
  }
}
