import { Entity } from "entities";
import { ToolType } from "ui/tools";
import UIManager from "ui/UIManager";
import { COMPONENT, Component, InteractableComponent, RenderComponent } from ".";
import { InteractableEvents } from "./InteractableComponent";

const HOVER_OUTLINE_COLOUR = 0xff0000;

export default class DebuggableComponent extends Component {
    public id: COMPONENT = "DEBUGGABLE_COMPONENT";
    public type: COMPONENT = "DEBUGGABLE_COMPONENT";

    public requires: COMPONENT[] = ["INTERACTABLE_COMPONENT", "RENDER_COMPONENT"];

    public renderer: RenderComponent;
    public interactable: InteractableComponent;

    private mouseDownHandle: string;
    private mouseEnterHandle: string;
    private mouseExitHandle: string;

    public start(entity: Entity): void {
        super.start(entity);

        this.renderer = entity.getComponent("RENDER_COMPONENT");
        this.interactable = entity.getComponent("INTERACTABLE_COMPONENT");

        this.mouseDownHandle = this.interactable.on(InteractableEvents.MouseDown, this.onMouseOver.bind(this));
        this.mouseEnterHandle = this.interactable.on(InteractableEvents.MouseEnter, this.onMouseOut.bind(this));
        this.mouseExitHandle = this.interactable.on(InteractableEvents.MouseExit, this.printDebugInfo.bind(this));
    }

    public end(): void {
        this.interactable.unsubscribe(InteractableEvents.MouseDown, this.mouseDownHandle);
        this.interactable.unsubscribe(InteractableEvents.MouseEnter, this.mouseEnterHandle);
        this.interactable.unsubscribe(InteractableEvents.MouseExit, this.mouseExitHandle);
    }

    private onMouseOver(): void {
        if (UIManager.getCurrentTool() !== ToolType.Debug) return;

        this.renderer.setOutline(HOVER_OUTLINE_COLOUR);
    }

    private onMouseOut(): void {
        if (UIManager.getCurrentTool() !== ToolType.Debug) return;

        this.renderer.setOutline();
    }

    private printDebugInfo(): void {
        if (UIManager.getCurrentTool() !== ToolType.Debug) return;

        console.group(`%cEntity ID: ${this.entity.id}`, "background-color: #ebdb9d; color: black");
        console.log("Components:");
        this.entity.getAllComponents().forEach(component => {
            console.group(`Component ID: ${component.id}`);
            component.printDebug();
            console.groupEnd();
        });
        console.groupEnd();
    }
}
