type ErrorListener = (error: Error) => void;

class ErrorEmitter {
  private listeners: Record<string, ErrorListener[]> = {};

  on(event: string, listener: ErrorListener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, error: Error): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(error));
    }
  }
}

export const errorEmitter = new ErrorEmitter();
