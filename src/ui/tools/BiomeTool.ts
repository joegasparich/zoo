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
            Graphics.setLineStyle(1, 0xFFFFFF);
            Graphics.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.WORLD_SCALE, this.currentBiome, 0.5);
        });
        ghost.setSnap(false);
    }

    public update(): void {
        const mouseWorldPos = ZooGame.camera.screenToWorldPosition(ZooGame.input.getMousePos());

        if (ZooGame.input.isInputHeld(Inputs.LeftMouse)) {
            ZooGame.world.biomeGrid.setBiome(mouseWorldPos.multiply(2), this.toolManager.radius * 2, this.currentBiome, ZooGame.world.getAreaAtPosition(mouseWorldPos));
        }
    }

    public postUpdate(): void {}
}
