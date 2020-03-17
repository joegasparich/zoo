import { TiledMap, MapData, TiledSet, TileSetData, TileData } from "engine/map";

// TODO: Handle multiple tilesets
export function parseTiledMap(tiledMap: TiledMap): MapData {
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

export function parseTiledSet(tsPath: string, tiledSet: TiledSet, image: PIXI.Texture): TileSetData {
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
        path: tsPath,
        image,
        height: image.height,
        width: image.width,
        tileSize: tiledSet.tilewidth,
        tiles,
    };
}
