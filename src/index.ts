import { AssetManager } from "engine/managers";

import { Assets } from "./consts";
import ZooGame from "ZooGame";
import TileObject from "entities/TileObject";

import "CameraControl";
import Wall from "world/Wall";

async function run(): Promise<void> {
    // Create game
    // Load Assets
    AssetManager.preLoadAssets(Object.values(Assets.SPRITES));
    AssetManager.preLoadAssets(Object.values(Assets.SPRITESHEETS));
    AssetManager.preLoadAssets(Object.values(Assets.UI));
    await TileObject.loadTileObjectData(Assets.OBJECTS.TREE);
    await Wall.loadWallData(Assets.WALLS.IRON_BAR);
    await AssetManager.loadTileSetFile(Assets.TILESETS.TEST);

    // Load game
    await ZooGame.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });
}

run();
