import "./app.scss";

import { AssetManager } from "managers";

import { Assets } from "./consts";
import Game from "Game";

import "CameraControl";
import { loadAnimalData, loadPathData, loadTileObjectData, loadWallData } from "helpers/assetLoaders";

async function run(): Promise<void> {
    // Load Assets
    AssetManager.preLoadAssets(Object.values(Assets.SPRITES));
    AssetManager.preLoadAssets(Object.values(Assets.SPRITESHEETS));
    AssetManager.preLoadAssets(Object.values(Assets.UI));
    // TODO: get progress for these
    await loadAnimalData(...Object.values(Assets.ANIMALS));
    await loadTileObjectData(...Object.values(Assets.FOLIAGE));
    await loadTileObjectData(...Object.values(Assets.BUILDING));
    await loadTileObjectData(...Object.values(Assets.CONSUMABLE));
    await loadWallData(...Object.values(Assets.WALLS));
    await loadPathData(...Object.values(Assets.PATHS));

    // Load game
    await Game.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });
}

run();
