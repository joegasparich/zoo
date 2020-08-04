import PlacementGhost from "ui/PlacementGhost";
import ToolManager from "ui/ToolManager";
import ZooGame from "ZooGame";

export enum ToolType {
    None,
    Tree,
    Wall,
    Biome,
}

export abstract class Tool {
    protected game: ZooGame;
    public abstract type: ToolType;

    public constructor(public toolManager: ToolManager) {
        this.game = toolManager.game;
    };
    public abstract set(ghost: PlacementGhost, data?: Record<string, any>): void;
    public abstract update(): void;
    public abstract postUpdate(): void;
}

export class NoTool extends Tool {
    public type = ToolType.None;

    public set(ghost: PlacementGhost): void {
        ghost.setVisible(false);
    }
    public update(): void {}
    public postUpdate(): void {}
}

export { default as BiomeTool } from "./BiomeTool";
export { default as WallTool } from "./WallTool";
export { default as TreeTool } from "./TreeTool";
