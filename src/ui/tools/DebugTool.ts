import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";

export default class DebugTool extends Tool {
    public type = ToolType.Debug;

    public set(ghost: PlacementGhost): void {
        ghost.reset();
        ghost.setSpriteVisible(false);
    }

    public update(): void {}
    public postUpdate(): void {}
}
