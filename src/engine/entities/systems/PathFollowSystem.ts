import { PhysicsSystem, SYSTEM, System } from ".";
import { Vector } from "engine";
import { Entity } from "..";
import Debug from "engine/Debug";

const DISTANCE_TO_NODE = 0.3;

export default class PathFollowSystem extends System {

    physics: PhysicsSystem;

    path: Vector[];
    currentNode: Vector;

    public start(entity: Entity): void {
        super.start(entity);

        this.physics = entity.getSystem(SYSTEM.PHYSICS_SYSTEM) as PhysicsSystem;
        if (!this.physics) {
            console.error("PathFollowSystem requires PhysicsSystem");
        }
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
        const cellSize = this.entity.game.map.cellSize;

        Debug.setLineStyle(3, 0x0000FF);

        Debug.drawLine(
            this.entity.position.x * cellSize,
            this.entity.position.y * cellSize,
            this.currentNode.x * cellSize,
            this.currentNode.y * cellSize);

        let lastNode = this.currentNode;
        this.path.forEach(node => {
            Debug.drawLine(
                lastNode.x * cellSize,
                lastNode.y * cellSize,
                node.x * cellSize,
                node.y * cellSize,
            );
            lastNode = node;
        });
    }
}
