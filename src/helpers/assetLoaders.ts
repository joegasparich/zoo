import { AssetManager } from "managers";
import { TileObjectData } from "types/AssetTypes";
import Vector from "vector";

export async function loadTileObjectData(path: string): Promise<TileObjectData> {
    const resource = await AssetManager.loadResource(path);
    const data = resource.data as TileObjectData;

    data.pivot = new Vector(data.pivot.x, data.pivot.y); // Ensure data from json is a vector

    await AssetManager.loadResource(data.sprite);
    return data;
}
