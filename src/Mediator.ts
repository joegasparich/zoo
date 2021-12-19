import uuid = require("uuid");

class Mediator {
    private listeners: Map<string, { handle: string; callback: (data: any) => void }[]>;

    public constructor() {
        this.listeners = new Map();
    }

    public on(event: string, callback: (data: any) => void): string {
        const context = uuid();

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ handle: context, callback });

        return context;
    }

    public fire(event: string, data?: Object): void {
        this.listeners.get(event)?.forEach(listener => listener.callback(data));
    }

    public unsubscribe(event: string, context: string): void {
        this.listeners.set(
            event,
            this.listeners.get(event).filter(listener => listener.handle !== context),
        );
    }
}

export default new Mediator();
