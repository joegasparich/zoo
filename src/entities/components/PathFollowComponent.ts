import { COMPONENT, Component } from ".";
import { Entity } from "..";
import Graphics from "Graphics";
import Mediator from "Mediator";
import { WorldEvent } from "consts";
import { ComponentSaveData } from "./Component";
import Vector from "vector";
import Game from "Game";
import { NodeType } from "world/PathfindingGrid";

const DISTANCE_TO_NODE = 0.3;

export interface PathFollowComponentSaveData extends ComponentSaveData {
    path: number[][];
    currentNode: number[];
}

export default class PathFollowComponent extends Component {
    public id: COMPONENT = "PATH_FOLLOW_COMPONENT";
    public type: COMPONENT = "PATH_FOLLOW_COMPONENT";

    private path: Vector[];
    public currentTarget: Vector;

    private placeSolidListener: string;
    private checkPathDebounce: number;

    public start(entity: Entity): void {
        super.start(entity);

        this.placeSolidListener = Mediator.on(WorldEvent.PLACE_SOLID, () => {
            if (!this.path) return;

            window.clearTimeout(this.checkPathDebounce);
            this.checkPathDebounce = window.setTimeout(this.checkPath.bind(this), 100);
        });
    }

    private checkPath(): void {
        if (!Game.map.checkPath([this.entity.position, this.currentTarget, ...this.path])) {
            this.pathTo(this.path.pop());
        }
    }

    public end(): void {
        Mediator.unsubscribe(WorldEvent.PLACE_SOLID, this.placeSolidListener);
    }

    public async pathTo(location: Vector): Promise<boolean> {
        this.resetPath();

        if (!location) return;

        const path = await Game.map.getPath(this.entity.position.floor(), location.floor(), {
            optimise: true,
            allowedNodes: [NodeType.OPEN, NodeType.PATH],
        });
        if (!path) return false;

        this.setPath(path);
        return true;
    }

    public setPath(path: Vector[]): void {
        this.path = path;
        this.path.shift(); // Ignore first node since that's where we started
        this.currentTarget = this.path.shift();
    }

    public hasPath(): boolean {
        return !!this.path;
    }

    public followPath(): boolean {
        if (!this.path) {
            return false;
        }

        if (Vector.Distance(this.entity.position, this.currentTarget) < DISTANCE_TO_NODE) {
            if (this.path.length < 1) {
                // Path complete
                this.resetPath();
                return true;
            }
            this.currentTarget = this.path.shift();
        }

        if (Game.debugSettings.showPathfinding) {
            this.drawDebugPath();
        }

        return false;
    }

    public resetPath(): void {
        this.path = undefined;
        this.currentTarget = undefined;
    }

    private drawDebugPath(): void {
        const cellSize = Game.map.cellSize;

        Graphics.setLineStyle(3, 0x0000ff);

        Graphics.drawLine(
            this.entity.position.x * cellSize,
            this.entity.position.y * cellSize,
            this.currentTarget.x * cellSize,
            this.currentTarget.y * cellSize,
        );

        let lastNode = this.currentTarget;
        Graphics.drawCircle(lastNode.multiply(cellSize), 2);
        this.path.forEach(node => {
            Graphics.drawLine(lastNode.x * cellSize, lastNode.y * cellSize, node.x * cellSize, node.y * cellSize);
            Graphics.drawCircle(node.multiply(cellSize), 2);
            lastNode = node;
        });
    }

    public save(): PathFollowComponentSaveData {
        return {
            ...super.save(),
            path: this.path?.map(node => Vector.Serialize(node)),
            currentNode: this.currentTarget && Vector.Serialize(this.currentTarget),
        };
    }

    public load(data: PathFollowComponentSaveData): void {
        super.load(data);

        this.path = data.path?.map(node => Vector.Deserialize(node));
        this.currentTarget = data.currentNode && Vector.Deserialize(data.currentNode);
    }

    public printDebug(): void {
        super.printDebug();

        console.log(`Path: ${this.path}`);
        console.log(`Current Target: ${this.currentTarget}`);
    }
}
