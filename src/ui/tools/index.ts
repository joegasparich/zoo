import PlacementGhost from "ui/PlacementGhost";
import ToolManager from "ui/ToolManager";

export enum ToolType {
    None,
    TileObject,
    Wall,
    Door,
    Delete,
    Biome,
    Hill,
}

export abstract class Tool {
    public abstract type: ToolType;

    public constructor(public toolManager: ToolManager) {};
    public abstract set(ghost: PlacementGhost, data?: Record<string, any>): void;
    public abstract update(): void;
    public abstract postUpdate(): void;
}

export class NoTool extends Tool {
    public type = ToolType.None;

    public set(ghost: PlacementGhost): void {
        ghost.reset();
        ghost.setVisible(false);
    }
    public update(): void {}
    public postUpdate(): void {}
}

export { default as BiomeTool } from "./BiomeTool";
export { default as HillTool } from "./HillTool";
export { default as WallTool } from "./WallTool";
export { default as DoorTool } from "./DoorTool";
export { default as DeleteTool } from "./DeleteTool";
export { default as TileObjectTool } from "./TileObjectTool";
