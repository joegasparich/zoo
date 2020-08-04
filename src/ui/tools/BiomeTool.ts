import { Config, Inputs } from "consts";
import { Debug } from "engine";
import { PlacementGhost } from "ui";
import { Biome } from "world/BiomeGrid";
import { Tool, ToolType } from ".";

export default class BiomeTool extends Tool {
    public type = ToolType.Biome;

    private currentBiome: Biome;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.currentBiome = data.biome;
        ghost.setDrawFunction(pos => {
            // TODO: Stop using Debug here
            Debug.setLineStyle(1, 0xFFFFFF);
            Debug.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.BIOME_SCALE, this.currentBiome, 0.5);
        });
        ghost.setSnap(false);
    }

    public update(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        if (this.game.input.isInputHeld(Inputs.LeftMouse)) {
            this.game.world.biomeGrid.setBiome(mouseWorldPos.multiply(2), this.toolManager.radius, this.currentBiome);
        }
        if (this.game.input.isInputPressed(Inputs.IncreaseBrushSize)) {
            this.toolManager.setRadius(Math.min(this.toolManager.radius + 0.25, 5));
        }
        if (this.game.input.isInputPressed(Inputs.DecreaseBrushSize)) {
            this.toolManager.setRadius(Math.max(this.toolManager.radius - 0.25, 0.5));
        }
    }

    public postUpdate(): void {}
}
