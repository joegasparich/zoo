import { Entity } from "entities";
import { ToolType } from "ui/tools";
import UIManager from "ui/UIManager";
import { COMPONENT, Component, RenderComponent } from ".";

const HOVER_OUTLINE_COLOUR = 0xff0000;

export default class DebuggableComponent extends Component {
    public id: COMPONENT = "DEBUGGABLE_COMPONENT";
    public type: COMPONENT = "DEBUGGABLE_COMPONENT";

    public requires: COMPONENT[] = ["RENDER_COMPONENT"];

    public renderer: RenderComponent;

    private boundMouseDownListener = this.printDebugInfo.bind(this);
    private boundMouseOverListener = this.onMouseOver.bind(this);
    private boundMouseOutListener = this.onMouseOut.bind(this);

    public start(entity: Entity): void {
        super.start(entity);

        this.renderer = entity.getComponent("RENDER_COMPONENT");

        const sprite = this.renderer.getSprite();
        sprite.interactive = true;
        sprite.on("mousedown", this.boundMouseDownListener);
        sprite.on("mouseover", this.boundMouseOverListener);
        sprite.on("mouseout", this.boundMouseOutListener);
    }

    public end(): void {
        const sprite = this.renderer.getSprite();

        sprite.interactive = false;
        sprite.off("mousedown", this.boundMouseDownListener);
        sprite.off("mouseover", this.boundMouseOverListener);
        sprite.off("mouseout", this.boundMouseOutListener);
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
