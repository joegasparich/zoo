import { Game } from "engine";

import { AssetManager } from "engine/managers";

import { Assets, Config } from "./consts";
import ZooGame from "ZooGame";
import TileObject from "entities/TileObject";

import "CameraControl";
import Wall from "world/Wall";

let testGame: Game;

async function run(): Promise<void> {
    // Create game
    testGame = new ZooGame({
        windowWidth: Config.WINDOW_WIDTH,
        windowHeight: Config.WINDOW_HEIGHT,
        enableDebug: Config.ENABLE_DEBUG,
        worldScale: 16,
    });

    // Load Assets
    AssetManager.preLoadAssets(Object.values(Assets.SPRITES));
    AssetManager.preLoadAssets(Object.values(Assets.SPRITESHEETS));
    AssetManager.preLoadAssets(Object.values(Assets.TILES));
    await TileObject.loadTileObjectData(Assets.OBJECTS.TREE);
    await Wall.loadWallData(Assets.WALLS.IRON_BAR);
    await AssetManager.loadTileSetFile(Assets.TILESETS.TEST);

    // Load game
    await testGame.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });
}

run();
