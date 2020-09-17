import { AssetManager } from "engine/managers";

import { Assets } from "./consts";
import ZooGame from "ZooGame";

import "CameraControl";
import Wall from "world/Wall";
import { loadTileObjectData } from "helpers/assetLoaders";

async function run(): Promise<void> {
    // Create game
    // Load Assets
    AssetManager.preLoadAssets(Object.values(Assets.SPRITES));
    AssetManager.preLoadAssets(Object.values(Assets.SPRITESHEETS));
    AssetManager.preLoadAssets(Object.values(Assets.UI));
    await loadTileObjectData(Assets.OBJECTS.TREE);
    await Wall.loadWallData(Assets.WALLS.IRON_BAR);

    // Load game
    await ZooGame.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });
}

run();
