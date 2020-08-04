import * as path from "path";

import { TileSet, Vector } from "engine";
import { AssetManager } from "engine/managers";
import { TiledMap, TiledSet, MapCell } from "engine/map";
import { TileSetData, TileData } from "engine/TileSet";

export interface MapFileData {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    tileSetPath: string;
    tileSet?: TileSet;
    tileData: number[];
}

// TODO: Handle multiple tilesets
export function parseTiledMap(tiledMap: TiledMap): MapFileData {
    if (!tiledMap) {
        console.error(`Can't parse map: ${tiledMap}`);
        return;
    }

    return {
        width: tiledMap.width,
        height: tiledMap.height,
        tileWidth: tiledMap.tilewidth,
        tileHeight: tiledMap.tileheight,
        tileSetPath: tiledMap.tilesets[0].source,
        tileData: tiledMap.layers[0].data,
    };
}

export function parseTiledSet(tiledSet: TiledSet, image: PIXI.Texture, imagePath: string): TileSetData {
    if (!tiledSet) {
        console.error(`Can't parse tileset: ${tiledSet}`);
        return;
    }
    if (!image) {
        console.error("Attempted to parse tileset before image was loaded");
        return;
    }

    // Generate tile array
    const tiles: TileData[] = [];
    for(let i = 0; i < tiledSet.tilecount; i++) {
        tiles.push({
            id: i,
            solid: false,
        });
    }

    // Set tile data
    tiledSet.tiles.forEach(tile => {
        tiles[tile.id].solid = tile.properties ? !!tile.properties.find(tile => tile.name === "solid").value : false;
    });

    return {
        image,
        cellWidth: tiledSet.tilewidth,
        cellHeight: tiledSet.tileheight,
        tiles,
        path: imagePath,
    };
}

/**
 * Loads a tiled map from file
 * @param location The file location
 * @param onProgress Callback for progress updates
 */
export async function loadMapFile(location: string, onProgress?: Function): Promise<MapCell[][]> {
    // Load Map File
    const mapResource = await AssetManager.loadResource(location, (progress: number) => onProgress && onProgress(progress/3));
    const tiledMap = parseTiledMap(mapResource.data as TiledMap);
    tiledMap.tileSetPath = path.join(location, "..", tiledMap.tileSetPath);

    // Load Tileset File
    tiledMap.tileSet = await AssetManager.loadTileSetFile(tiledMap.tileSetPath, (progress: number) => onProgress && onProgress(progress * 2/3 + 33.33));

    // Load Map
    this.cellSize = tiledMap.tileWidth;
    this.position = new Vector(this.cellSize/2, this.cellSize/2);
    this.rows = tiledMap.width;
    this.cols = tiledMap.height;

    // Generate cell grid
    const cells: MapCell[][] = [];
    for (let i = 0; i < tiledMap.height; i++) {
        cells[i] = [];
        for  (let j = 0; j < tiledMap.width; j++) {
            const tileIndex = tiledMap.tileData[j * tiledMap.width + i] - 1;
            cells[i][j] = {
                position: new Vector(i, j),
                texture: tiledMap.tileSet.getTextureById(tileIndex),
                isSolid: tiledMap.tileSet.tiles.get(tileIndex).solid,
            };
        }
    }

    return cells;
}
