export {};

declare global {
  interface Window {
    markCompleted?: (lessonId: string) => void;
    showConfetti?: () => void;
    magicTableListenerBound?: boolean;
  }

  interface Document {
    _magicTriggerBridgeBound?: boolean;
  }

  interface HTMLElement {
    _autosaveStatusTimer?: ReturnType<typeof setTimeout>;
    _saveTo?: ReturnType<typeof setTimeout>;
    _labResizeHandler?: () => void;
  }
}
