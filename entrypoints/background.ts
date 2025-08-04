export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error));

  chrome.runtime.onMessage.addListener((
    request: { type: string; message?: string }, 
    _sender: chrome.runtime.MessageSender, 
    sendResponse: (response: { reply: string }) => void
  ) => {
    if (request.type === "greeting") {
      console.log("Content script said:", request.message);
      sendResponse({ reply: "Hello from background!" });
    }
  });
});

