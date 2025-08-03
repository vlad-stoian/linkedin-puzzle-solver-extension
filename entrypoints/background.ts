export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));


  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "greeting") {
      console.log("Content script said:", request.message);
      sendResponse({ reply: "Hello from background!" });
    }
    // Return true if you're sending the response asynchronously
  });
});

