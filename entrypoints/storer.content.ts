import type { CustomEventDetail } from '@/types/solutions';
import { debug } from '@/utils/debug';

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  matchAboutBlank: true,
  allFrames: true,
  world: "ISOLATED",
  main() {
    window.addEventListener("MagicalNarwhal", function (event: Event) {
      const customEvent = event as CustomEvent<CustomEventDetail>;
      debug.log("MagicalNarwhal event received:", customEvent);
      if (customEvent?.detail?.tangoSolution) {
        debug.log("Tango solution:", customEvent.detail.tangoSolution);
        debug.log("Tango solution JSON:", JSON.stringify(customEvent.detail.tangoSolution));
        window.chrome.storage.local.set({ [`tangoSolution`]: JSON.stringify(customEvent.detail.tangoSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'tango' });
      }

      if (customEvent?.detail?.crossclimbSolution) {
        debug.log("Crossclimb solution:", customEvent.detail.crossclimbSolution);
        debug.log("Crossclimb solution JSON:", JSON.stringify(customEvent.detail.crossclimbSolution));
        window.chrome.storage.local.set({ [`crossclimbSolution`]: JSON.stringify(customEvent.detail.crossclimbSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'crossclimb' });
      }

      if (customEvent?.detail?.pinpointSolution) {
        debug.log("Pinpoint solution:", customEvent.detail.pinpointSolution);
        debug.log("Pinpoint solution JSON:", JSON.stringify(customEvent.detail.pinpointSolution));
        window.chrome.storage.local.set({ [`pinpointSolution`]: JSON.stringify(customEvent.detail.pinpointSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'pinpoint' });
      }

      if (customEvent?.detail?.queensSolution) {
        debug.log("Queens solution:", customEvent.detail.queensSolution);
        debug.log("Queens solution JSON:", JSON.stringify(customEvent.detail.queensSolution));
        window.chrome.storage.local.set({ [`queensSolution`]: JSON.stringify(customEvent.detail.queensSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'queens' });
      }

      if (customEvent?.detail?.zipSolution) {
        debug.log("Zip solution:", customEvent.detail.zipSolution);
        debug.log("Zip solution JSON:", JSON.stringify(customEvent.detail.zipSolution));
        window.chrome.storage.local.set({ [`zipSolution`]: JSON.stringify(customEvent.detail.zipSolution) });
        window.chrome.storage.local.set({ [`currentGame`]: 'zip' });
      }

    }, false);
  }
});
