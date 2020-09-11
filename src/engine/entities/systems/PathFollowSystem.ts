import { PhysicsSystem, SYSTEM, System } from ".";
import { Vector } from "engine";
import { Entity } from "..";
import Graphics from "engine/Graphics";
import Mediator from "engine/Mediator";
import { MapEvent } from "engine/consts";

const DISTANCE_TO_NODE = 0.3;

export default class PathFollowSystem extends System {
    public id = SYSTEM.PATH_FOLLOW_SYSTEM;

    private physics: PhysicsSystem;

    private path: Vector[];
    private currentNode: Vector;

    private placeSolidListener: string;

    public start(entity: Entity): void {
        super.start(entity);

        this.physics = entity.getSystem(SYSTEM.PHYSICS_SYSTEM) as PhysicsSystem;
        if (!this.physics) {
            console.error("PathFollowSystem requires PhysicsSystem");
        }

        this.placeSolidListener = Mediator.on(MapEvent.PLACE_SOLID, () => {
            if (!this.path) return;

            if (!entity.game.map.checkPath([this.entity.position, this.currentNode, ...this.path])) {
                this.pathTo(this.path.pop());
            }
        });
    }

    public end(): void {
        Mediator.unsubscribe(MapEvent.PLACE_SOLID, this.placeSolidListener);
    }

    public async pathTo(location: Vector): Promise<boolean> {
        this.resetPath();

        const path = await this.entity.game.map.getPath(this.entity.position.floor(), location.floor(), {optimise: true});
        if (!path) return false;

        this.setPath(path);
        return true;
    }

    public setPath(path: Vector[]): void {
        this.path = path;
        this.path.shift(); // Ignore first node since that's where we started
        this.currentNode = this.path.shift();
    }

    public hasPath(): boolean {
        return !!this.path;
    }

    protected moveTowardTarget(target: Vector, speed: number): void {
        this.physics.addForce(target.subtract(this.entity.position).normalize().multiply(speed));
    }

    public followPath(speed: number): boolean {
        if (!this.path) {
            return false;
        }

        if (Vector.Distance(this.entity.position, this.currentNode) < DISTANCE_TO_NODE) {
            if (this.path.length < 1) {
                // Path complete
                this.path = undefined;
                return true;
            }
            this.currentNode = this.path.shift();
        }

        this.moveTowardTarget(this.currentNode, speed);

        // TODO: Add debug button for this
        this.drawDebugPath();

        return false;
    }

    protected resetPath(): void {
        this.path = undefined;
        this.currentNode = undefined;
    }

    private drawDebugPath(): void {
        const cellSize = this.game.map.cellSize;

        Graphics.setLineStyle(3, 0x0000FF);

        Graphics.drawLine(
            this.entity.position.x * cellSize,
            this.entity.position.y * cellSize,
            this.currentNode.x * cellSize,
            this.currentNode.y * cellSize);

        let lastNode = this.currentNode;
        Graphics.drawCircle(lastNode.multiply(cellSize), 2);
        this.path.forEach(node => {
            Graphics.drawLine(
                lastNode.x * cellSize,
                lastNode.y * cellSize,
                node.x * cellSize,
                node.y * cellSize,
            );
            Graphics.drawCircle(node.multiply(cellSize), 2);
            lastNode = node;
        });
    }
}
