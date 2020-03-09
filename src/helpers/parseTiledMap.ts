import { TiledMap } from "../types/TiledMap";
import MapData from "types/Map";

// TODO: Handle multiple tilesets
export default function parseTiledMap(tiledMap: TiledMap): MapData {

    return {
        width: tiledMap.width,
        height: tiledMap.height,
        tileSet: tiledMap.properties.find(prop => prop.name === "tileset").value,
        tileData: tiledMap.layers[0].data,
    }
}