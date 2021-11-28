import { Entity } from "entities";
import { ToolType } from "ui/tools";
import UIManager from "ui/UIManager";
import { COMPONENT, Component, RenderComponent } from ".";

export default class DebuggableComponent extends Component {
    public id: COMPONENT = "DEBUGGABLE_COMPONENT";
    public type: COMPONENT = "DEBUGGABLE_COMPONENT";

    public requires: COMPONENT[] = ["RENDER_COMPONENT"];

    public renderer: RenderComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.renderer = entity.getComponent("RENDER_COMPONENT");

        const sprite = this.renderer.getSprite();
        sprite.interactive = true;
        sprite.on("mousedown", this.printDebugInfo.bind(this));
    }

    private printDebugInfo(): void {
        if (UIManager.getCurrentTool() !== ToolType.Debug) return;

        console.group(`%cEntity ID: ${this.entity.id}`, "background-color: #ebdb9d; color: black");
        console.log("Components:");
        this.entity.getAllComponents().forEach(component => {
            console.group(`Component ID: ${component.type}`);
            component.printDebug();
            console.groupEnd();
        });
        console.groupEnd();
    }
}
