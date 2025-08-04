// Global type declarations for the project

declare global {
  interface Window {
    Ember?: any;
    Application?: any;
    navigation?: {
      addEventListener: (event: string, callback: (event: NavigateEvent) => void) => void;
    };
    chrome: typeof chrome;
    requireModule?: (module: string) => { default?: any };
    require?: (module: string) => { default?: any };
  }

  interface NavigateEvent extends Event {
    destination: { url: string };
  }
}

export {};