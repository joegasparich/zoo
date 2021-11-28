import { Entity } from "entities";
import { RenderComponent, COMPONENT, Component } from "entities/components";
import Game from "Game";

/**
 * Note: this should be added after any movement components
 */
export default class ElevationComponent extends Component {
    public id: COMPONENT = "ELEVATION_COMPONENT";
    public type: COMPONENT = "ELEVATION_COMPONENT";
    public requires: COMPONENT[] = ["RENDER_COMPONENT"];

    private renderer: RenderComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.renderer = entity.getComponent("RENDER_COMPONENT");
    }

    public update(delta: number): void {
        super.update(delta);

        this.renderer.offset.y = -Game.world.elevationGrid.getElevationAtPoint(this.entity.position);
    }

    public printDebug(): void {
        super.printDebug();

        console.log(`Current Elevation: ${-Game.world.elevationGrid.getElevationAtPoint(this.entity.position)}`);
    }
}
