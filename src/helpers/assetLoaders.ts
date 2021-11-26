import { AssetManager } from "managers";
import SpriteSheet from "SpriteSheet";
import { AnimalData, PathData, TileObjectData, WallData } from "types/AssetTypes";
import Path from "world/Path";
import Wall from "world/Wall";

export async function loadAnimalData(...paths: string[]): Promise<AnimalData[]> {
    const resources = await AssetManager.loadResources(paths);
    await AssetManager.loadResources(resources.map(resource => resource.data.sprite));

    return resources.map(resource => resource.data);
}

export async function loadTileObjectData(...paths: string[]): Promise<TileObjectData[]> {
    const resources = await AssetManager.loadResources(paths);
    await AssetManager.loadResources(resources.map(resource => resource.data.sprite));

    return resources.map(resource => resource.data);
}

export async function loadWallData(...paths: string[]): Promise<WallData[]> {
    const resources = await AssetManager.loadResources(paths);
    await AssetManager.loadResources(resources.map(resource => resource.data.spriteSheet));

    resources.forEach(resource => {
        const data = resource.data as WallData;

        const spritesheet = new SpriteSheet({
            imageUrl: data.spriteSheet,
            cellHeight: data.cellHeight,
            cellWidth: data.cellWidth,
        });
        Wall.wallSprites.set(data.spriteSheet, spritesheet);
    });

    return resources.map(resource => resource.data);
}

export async function loadPathData(...paths: string[]): Promise<PathData[]> {
    const resources = await AssetManager.loadResources(paths);
    await AssetManager.loadResources(resources.map(resource => resource.data.spriteSheet));

    resources.forEach(resource => {
        const data = resource.data as PathData;

        const spritesheet = new SpriteSheet({
            imageUrl: data.spriteSheet,
            cellHeight: data.cellHeight,
            cellWidth: data.cellWidth,
        });

        Path.pathSprites.set(data.spriteSheet, spritesheet);
    });

    return resources.map(resource => resource.data);
}
