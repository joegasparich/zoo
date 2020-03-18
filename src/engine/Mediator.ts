class Mediator {

    listeners: Map<string, Function[]>;

    constructor() {
        this.listeners = new Map();
    }

    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    fire(event: string, data?: Object): void {
        this.listeners.get(event)?.forEach(callback => callback(data));
    }
}

export default new Mediator();
