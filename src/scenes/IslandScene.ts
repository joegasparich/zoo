import { Scene } from "engine";
import { MapGrid, MapCell } from "engine/map";

import GroundTile from "world/GroundTile";
import { TILES } from "constants/assets";

export default class IslandScene extends Scene {
    start(map: MapGrid) {
        map.setupTileGrid(this.generateMap());
    }

    generateMap(): MapCell[][] {
        const cells: MapCell[][] = [];

        for (let i = 0; i < 100; i++) {
            cells[i] = [];
            for (let j = 0; j < 100; j++) {
                const tile = new GroundTile(TILES.GRASS);
                cells[i][j] = {
                    x: i,
                    y: j,
                    texture: tile.texture,
                    isSolid: false,
                };
            }
        }

        return cells;
    }
}
