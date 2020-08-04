class Mediator {

    private listeners: Map<string, Function[]>;

    public constructor() {
        this.listeners = new Map();
    }

    public on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    public fire(event: string, data?: Object): void {
        this.listeners.get(event)?.forEach(callback => callback(data));
    }
}

export default new Mediator();
