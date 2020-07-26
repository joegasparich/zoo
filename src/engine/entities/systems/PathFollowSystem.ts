import { PhysicsSystem, SYSTEM, System } from ".";
import { Vector } from "engine";
import { Entity } from "..";
import Debug from "engine/Debug";
import Mediator from "engine/Mediator";
import { MapEvent } from "engine/consts";

const DISTANCE_TO_NODE = 0.3;

export default class PathFollowSystem extends System {

    private physics: PhysicsSystem;

    private path: Vector[];
    private currentNode: Vector;

    public start(entity: Entity): void {
        super.start(entity);

        this.physics = entity.getSystem(SYSTEM.PHYSICS_SYSTEM) as PhysicsSystem;
        if (!this.physics) {
            console.error("PathFollowSystem requires PhysicsSystem");
        }

        Mediator.on(MapEvent.PLACE_SOLID, () => {
            if (!this.path) return;

            if (!entity.game.map.checkPath([this.entity.position, this.currentNode, ...this.path])) {
                this.pathTo(this.path.pop());
            }
        });
    }

    public async pathTo(location: Vector): Promise<boolean> {
        this.path = undefined;
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

    private moveTowardTarget(target: Vector, speed: number): void {
        this.physics.addForce(target.subtract(this.entity.position).normalize().multiply(speed));
    }

    public followPath(speed: number): void {
        if (!this.path) {
            return;
        }

        if (Vector.Distance(this.entity.position, this.currentNode) < DISTANCE_TO_NODE) {
            if (this.path.length < 1) {
                // Path complete
                this.path = undefined;
                return;
            }
            this.currentNode = this.path.shift();
        }

        this.moveTowardTarget(this.currentNode, speed);

        this.drawDebugPath();
    }

    private drawDebugPath(): void {
        const cellSize = this.game.map.cellSize;

        Debug.setLineStyle(3, 0x0000FF);

        Debug.drawLine(
            this.entity.position.x * cellSize,
            this.entity.position.y * cellSize,
            this.currentNode.x * cellSize,
            this.currentNode.y * cellSize);

        let lastNode = this.currentNode;
        Debug.drawCircle(lastNode.multiply(cellSize), 2);
        this.path.forEach(node => {
            Debug.drawLine(
                lastNode.x * cellSize,
                lastNode.y * cellSize,
                node.x * cellSize,
                node.y * cellSize,
            );
            Debug.drawCircle(node.multiply(cellSize), 2);
            lastNode = node;
        });
    }
}
