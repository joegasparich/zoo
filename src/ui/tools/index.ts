import PlacementGhost from "ui/PlacementGhost";
import ToolManager from "ui/ToolManager";

export enum ToolType {
    None,
    TileObject,
    Wall,
    Door,
    Delete,
    Biome,
    Elevation,
}

export interface Action {
    name: string;
    data: any;
    undo: (data: any) => void;
}

export abstract class Tool {
    public abstract type: ToolType;

    public constructor(public toolManager: ToolManager) {};
    public abstract set(ghost: PlacementGhost, data?: Record<string, any>): void;
    public abstract update(): void;
    public abstract postUpdate(): void;

    protected registerAction(action: Action): void {
        this.toolManager.pushAction(action);
    }
}

export class NoTool extends Tool {
    public type = ToolType.None;

    public set(ghost: PlacementGhost): void {
        ghost.reset();
        ghost.setSpriteVisible(false);
    }
    public update(): void {}
    public postUpdate(): void {}
}

export { default as BiomeTool } from "./BiomeTool";
export { default as ElevationTool } from "./ElevationTool";
export { default as WallTool } from "./WallTool";
export { default as DoorTool } from "./DoorTool";
export { default as DeleteTool } from "./DeleteTool";
export { default as TileObjectTool } from "./TileObjectTool";
