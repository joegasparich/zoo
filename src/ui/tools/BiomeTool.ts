import { Config, Inputs } from "consts";
import Graphics from "Graphics";
import PlacementGhost from "ui/PlacementGhost";
import Vector from "vector";
import { Biome, BiomeChunk } from "world/BiomeGrid";
import Game from "Game";
import { Tool, ToolType } from ".";

const BIOME_UPDATE_INTERVAL = 50;

export default class BiomeTool extends Tool {
    public type = ToolType.Biome;

    private currentBiome: Biome;

    private chunksUpdated: Map<BiomeChunk, Biome[][][]>;
    private placementIntervalRef: number;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.chunksUpdated = new Map();

        this.currentBiome = data.biome;
        ghost.reset();
        ghost.drawFunction = (pos: Vector): void => {
            Graphics.setLineStyle(1, 0xFFFFFF);
            Graphics.drawCircle(pos.multiply(Config.WORLD_SCALE), this.toolManager.radius * Config.WORLD_SCALE, this.currentBiome, 0.5);
        };
        ghost.setSpriteVisible(false);
    }

    public update(): void {
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            if (this.placementIntervalRef) return;
            this.placementIntervalRef = window.setInterval(() => {
                const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());
                Game.world.biomeGrid.getChunksInRadius(mouseWorldPos.multiply(2), this.toolManager.radius * 2).forEach(chunk => {
                    // Make backup of chunks
                    if (!this.chunksUpdated.has(chunk)) {
                        this.chunksUpdated.set(chunk, chunk.getCopy());
                    }
                });
                Game.world.biomeGrid.setBiome(mouseWorldPos.multiply(2), this.toolManager.radius * 2, this.currentBiome, Game.world.getAreaAtPosition(mouseWorldPos));
            }, BIOME_UPDATE_INTERVAL);
        } else {
            window.clearInterval(this.placementIntervalRef);
            this.placementIntervalRef = undefined;
        }

        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            const chunkData: any[] = [];
            this.chunksUpdated.forEach((data, chunk)  => {
                chunkData.push([chunk, data]);
            });

            this.toolManager.pushAction({
                name: "Biome Brush",
                data: {
                    chunkData,
                },
                undo: (data: any): void => {
                    const chunkData = data.chunkData as [BiomeChunk, Biome[][][]][];
                    chunkData.forEach(([chunk, data]) => {
                        chunk.setData(data);
                        chunk.shouldRedraw = true;
                    });
                },
            });

            this.chunksUpdated = new Map();
        }
    }

    public postUpdate(): void {}
}
