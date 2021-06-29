import { Entity } from "entities";
import { RenderComponent, COMPONENT, Component } from "entities/components";
import Game from "Game";

/**
 * Note: this should be added after any movement components
 */
export default class ElevationComponent extends Component {
    public id = "ELEVATION_COMPONENT";
    public type = "ELEVATION_COMPONENT";

    private renderer: RenderComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.renderer = entity.getComponent(COMPONENT.RENDER_COMPONENT) as RenderComponent;
        if (!this.renderer) {
            console.error("ElevationComponent requires RenderComponent");
        }
    }

    public update(delta: number): void {
        super.update(delta);

        this.renderer.offset.y = -Game.world.elevationGrid.getElevationAtPoint(this.entity.position);
    }
}
