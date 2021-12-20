import { Entity } from "entities";
import uuid from "uuid";
import { COMPONENT, Component, RenderComponent } from ".";

export enum InteractableEvents {
    MouseDown,
    MouseEnter,
    MouseExit,
}

export default class InteractableComponent extends Component {
    public id: COMPONENT = "INTERACTABLE_COMPONENT";
    public type: COMPONENT = "INTERACTABLE_COMPONENT";

    public requires: COMPONENT[] = ["RENDER_COMPONENT"];

    public renderer: RenderComponent;

    private boundMouseDownListener = this.onMouseDown.bind(this);
    private boundMouseOverListener = this.onMouseOver.bind(this);
    private boundMouseOutListener = this.onMouseOut.bind(this);

    private listeners: Map<InteractableEvents, { handle: string; callback: () => void }[]>;

    public start(entity: Entity): void {
        super.start(entity);

        this.listeners = new Map();

        this.renderer = entity.getComponent("RENDER_COMPONENT");

        const sprite = this.renderer.getSprite();
        sprite.interactive = true;

        sprite.on("mousedown", this.boundMouseDownListener);
        sprite.on("mouseover", this.boundMouseOverListener);
        sprite.on("mouseout", this.boundMouseOutListener);
    }

    public end(): void {
        const sprite = this.renderer?.getSprite();
        if (sprite) {
            sprite.interactive = false;

            sprite.off("mousedown", this.boundMouseDownListener);
            sprite.off("mouseover", this.boundMouseOverListener);
            sprite.off("mouseout", this.boundMouseOutListener);
        }

        this.listeners = new Map();
    }

    private onMouseOver(): void {
        this.listeners.get(InteractableEvents.MouseEnter).forEach(listener => listener.callback());
    }

    private onMouseOut(): void {
        this.listeners.get(InteractableEvents.MouseExit).forEach(listener => listener.callback());
    }

    private onMouseDown(): void {
        this.listeners.get(InteractableEvents.MouseDown).forEach(listener => listener.callback());
    }

    public on(event: InteractableEvents, callback: () => void): string {
        const handle = uuid();

        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ handle, callback });

        return handle;
    }

    public unsubscribe(event: InteractableEvents, handle: string): void {
        this.listeners.set(
            event,
            this.listeners.get(event)?.filter(listener => listener.handle !== handle),
        );
    }
}
