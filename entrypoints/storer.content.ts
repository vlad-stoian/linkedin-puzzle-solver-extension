import type { CustomEventDetail } from '@/types/solutions';

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  matchAboutBlank: true,
  allFrames: true,
  world: "ISOLATED",
  main() {
    window.addEventListener("MagicalNarwhal", function (event: Event) {
      const customEvent = event as CustomEvent<CustomEventDetail>;
      console.log("MagicalNarwhal event received:", customEvent);
      if (customEvent?.detail?.tangoSolution) {
        console.log("Tango solution:", customEvent.detail.tangoSolution);
        console.log(JSON.stringify(customEvent.detail.tangoSolution));
        window.chrome.storage.local.set({ [`tangoSolution`]: JSON.stringify(customEvent.detail.tangoSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'tango' });
      }

      if (customEvent?.detail?.crossclimbSolution) {
        console.log("Crossclimb solution:", customEvent.detail.crossclimbSolution);
        console.log(JSON.stringify(customEvent.detail.crossclimbSolution));
        window.chrome.storage.local.set({ [`crossclimbSolution`]: JSON.stringify(customEvent.detail.crossclimbSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'crossclimb' });
      }

      if (customEvent?.detail?.pinpointSolution) {
        console.log("Pinpoint solution:", customEvent.detail.pinpointSolution);
        console.log(JSON.stringify(customEvent.detail.pinpointSolution));
        window.chrome.storage.local.set({ [`pinpointSolution`]: JSON.stringify(customEvent.detail.pinpointSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'pinpoint' });
      }

      if (customEvent?.detail?.queensSolution) {
        console.log("Queens solution:", customEvent.detail.queensSolution);
        console.log(JSON.stringify(customEvent.detail.queensSolution));
        window.chrome.storage.local.set({ [`queensSolution`]: JSON.stringify(customEvent.detail.queensSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'queens' });
      }

      if (customEvent?.detail?.zipSolution) {
        console.log("Zip solution:", customEvent.detail.zipSolution);
        console.log(JSON.stringify(customEvent.detail.zipSolution));
        window.chrome.storage.local.set({ [`zipSolution`]: JSON.stringify(customEvent.detail.zipSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'zip' });
      }

    }, false);
  }
});
