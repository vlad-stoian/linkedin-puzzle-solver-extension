export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  matchAboutBlank: true,
  allFrames: true,
  world: "ISOLATED",
  main() {
    window.addEventListener("MagicalNarwhal", function (event) {
      console.log("MagicalNarwhal event received:", event);
      if (event?.detail?.tangoSolution) {
        console.log("Tango solution:", event.detail.tangoSolution);
        console.log(JSON.stringify(event.detail.tangoSolution));
        window.chrome.storage.local.set({ [`tangoSolution`]: JSON.stringify(event.detail.tangoSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'tango' });
      }

      if (event?.detail?.crossclimbSolution) {
        console.log("Crossclimb solution:", event.detail.crossclimbSolution);
        console.log(JSON.stringify(event.detail.crossclimbSolution));
        window.chrome.storage.local.set({ [`crossclimbSolution`]: JSON.stringify(event.detail.crossclimbSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'crossclimb' });
      }

      if (event?.detail?.pinpointSolution) {
        console.log("Pinpoint solution:", event.detail.pinpointSolution);
        console.log(JSON.stringify(event.detail.pinpointSolution));
        window.chrome.storage.local.set({ [`pinpointSolution`]: JSON.stringify(event.detail.pinpointSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'pinpoint' });
      }

      if (event?.detail?.queensSolution) {
        console.log("Queens solution:", event.detail.queensSolution);
        console.log(JSON.stringify(event.detail.queensSolution));
        window.chrome.storage.local.set({ [`queensSolution`]: JSON.stringify(event.detail.queensSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'queens' });
      }

      if (event?.detail?.zipSolution) {
        console.log("Zip solution:", event.detail.zipSolution);
        console.log(JSON.stringify(event.detail.zipSolution));
        window.chrome.storage.local.set({ [`zipSolution`]: JSON.stringify(event.detail.zipSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'zip' });
      }

    }, false);
  }
});
