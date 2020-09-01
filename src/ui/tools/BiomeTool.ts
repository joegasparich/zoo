import { Config, Inputs } from "consts";
import { Graphics } from "engine";
import PlacementGhost from "ui/PlacementGhost";
import { Biome } from "world/BiomeGrid";
import ZooGame from "ZooGame";
import { Tool, ToolType } from ".";

export default class BiomeTool extends Tool {
    public type = ToolType.Biome;

    private currentBiome: Biome;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.currentBiome = data.biome;
        ghost.setDrawFunction(pos => {
            // TODO: Stop using Debug here
            Graphics.setLineStyle(1, 0xFFFFFF);
            Graphics.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.BIOME_SCALE, this.currentBiome, 0.5);
        });
        ghost.setSnap(false);
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        if (ZooGame.input.isInputHeld(Inputs.LeftMouse)) {
            ZooGame.world.biomeGrid.setBiome(mouseWorldPos.multiply(2), this.toolManager.radius, this.currentBiome);
        }
        if (ZooGame.input.isInputPressed(Inputs.IncreaseBrushSize)) {
            this.toolManager.setRadius(Math.min(this.toolManager.radius + 0.25, 5));
        }
        if (ZooGame.input.isInputPressed(Inputs.DecreaseBrushSize)) {
            this.toolManager.setRadius(Math.max(this.toolManager.radius - 0.25, 0.5));
        }
    }

    public postUpdate(): void {}
}
