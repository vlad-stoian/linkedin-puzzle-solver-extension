import { debug } from '@/utils/debug';

export default defineBackground(() => {
  debug.log('Hello background!', { id: browser.runtime.id });

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => debug.error('Background error:', error));

  chrome.runtime.onMessage.addListener((
    request: { type: string; message?: string }, 
    _sender: chrome.runtime.MessageSender, 
    sendResponse: (response: { reply: string }) => void
  ) => {
    if (request.type === "greeting") {
      debug.log("Content script said:", request.message);
      sendResponse({ reply: "Hello from background!" });
    }
  });
});

