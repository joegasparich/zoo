import "./app.scss";

import { AssetManager } from "managers";

import { Assets } from "./consts";
import Game from "Game";

import "CameraControl";
import Wall from "world/Wall";
import { loadTileObjectData } from "helpers/assetLoaders";
import Path from "world/Path";

async function run(): Promise<void> {
    // Create game
    // Load Assets
    AssetManager.preLoadAssets(Object.values(Assets.SPRITES));
    AssetManager.preLoadAssets(Object.values(Assets.SPRITESHEETS));
    AssetManager.preLoadAssets(Object.values(Assets.UI));
    await loadTileObjectData(Assets.OBJECTS.TREE);
    await Wall.loadWallData(Assets.WALLS.IRON_BAR);
    await Path.loadPathData(Assets.PATHS.DIRT);

    // Load game
    await Game.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });
}

run();
