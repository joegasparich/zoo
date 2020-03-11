import { TiledMap, MapData } from "engine/map";

// TODO: Handle multiple tilesets
export default function parseTiledMap(tiledMap: TiledMap): MapData {
    if (!tiledMap) {
        console.error(`Can't parse map: ${tiledMap}`);
        return;
    }

    return {
        width: tiledMap.width,
        height: tiledMap.height,
        tileWidth: tiledMap.tilewidth,
        tileHeight: tiledMap.tileheight,
        tileSet: tiledMap.properties.find(prop => prop.name === "tileset").value,
        tileData: tiledMap.layers[0].data,
    }
}