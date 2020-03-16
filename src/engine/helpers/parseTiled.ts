import { TiledMap, MapData, TiledSet, TileSetData } from "engine/map";

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
    }
}

export function parseTiledSet(tsPath: string, tiledSet: TiledSet, image: PIXI.Texture): TileSetData {
    if (!tiledSet) {
        console.error(`Can't parse tileset: ${tiledSet}`);
        return;
    }
    if (!image) {
        console.error('Attempted to parse tileset before image was loaded')
        return;
    }

    return {
        path: tsPath,
        image,
        height: image.height,
        width: image.width,
        tileSize: tiledSet.tilewidth
    }
}