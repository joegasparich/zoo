import { Game } from "engine";
import { Layers, TAG } from "engine/consts";
import { ColliderType } from "engine/managers";
import Vector from "engine/vector";
import { MapGrid } from ".";
import { MapCell } from "./MapGrid";

export default class TileGrid {
    private tiles: PIXI.tilemap.CompositeRectTileLayer;

    public constructor(private game: Game, private map: MapGrid, cells: MapCell[][]) {
        this.setup(cells);
    }

    public postUpdate(): void {
        if (this.tiles) {
            this.drawTiles();
        }
    }

    /**
     * Sets up the tile grid
     * @param cells The map cells to generate the tile grid from
     */
    public setup(cells: MapCell[][]): void {
        const textures: PIXI.Texture[] = [];
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i].length; j++) {
                textures.push(cells[i][j].texture);
            }
        }
        this.tiles = new PIXI.tilemap.CompositeRectTileLayer(0, textures);
        this.tiles.parentGroup = Layers.GROUND;
        this.game.stage.addChild(this.tiles);
        this.updateTiles();
    }

    /**
     * Reset the tile grid back to an empty state
     */
    public reset(): void {
        this.game.stage.removeChild(this.tiles);
        this.tiles = null;
    }

    /**
     * Clears and recreates all tiles on the map,
     * this needs to be done because the tile grid is all one big texture
     * TODO: Chunk the map to avoid big updates
     */
    private updateTiles(): void {
        const scale = (this.game.opts.worldScale/this.map.cellSize); // Ideally this is 1 (16/16)

        this.tiles.clear();
        for (let i = 0; i <= this.map.cols - 1; i++) {
            for (let j = 0; j <= this.map.rows - 1; j++) {
                const tile = this.map.getCell(new Vector(i, j));
                if (!tile) { continue; }

                // Texture
                const texture = tile.texture;
                this.tiles.addFrame(texture, i * this.map.cellSize * scale, j * this.map.cellSize * scale);

                // Collision
                if (tile.isSolid) {
                    this.map.setTileSolid(new Vector(tile.x, tile.y), true);
                    this.game.physicsManager.createPhysicsObject({
                        collider: {
                            type: ColliderType.Rect,
                            height: 1,
                            width: 1,
                        },
                        position: new Vector(tile.x + 0.5, tile.y + 0.5),
                        tag: TAG.Solid,
                        isDynamic: false,
                    });
                }
            }
        }
    }

    /**
     * Update the position and scale of the tile grid
     */
    private drawTiles(): void {
        this.tiles.position = this.game.camera.worldToScreenPosition(Vector.Zero).toPoint();
        this.tiles.scale.set(this.game.camera.scale, this.game.camera.scale);
    }
}
