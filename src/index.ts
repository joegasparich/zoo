import { Game } from "engine";

import CONFIG from "constants/config";
import { SPRITES, TILES, SPRITESHEETS, TILESETS, OBJECTS } from "constants/assets";
import { AssetManager } from "engine/managers";
import TileObject from "entities/TileObject";
import GameManager from "GameManager";

import "CameraControl";

let testGame: Game;

let gameManager: GameManager;

async function run() {
    // Create game
    testGame = new Game({
        windowWidth: CONFIG.WINDOW_WIDTH,
        windowHeight: CONFIG.WINDOW_HEIGHT,
        enableDebug: CONFIG.ENABLE_DEBUG,
        worldScale: 16,
    });

    // Load Assets
    AssetManager.preLoadAssets(Object.values(SPRITES));
    AssetManager.preLoadAssets(Object.values(SPRITESHEETS));
    AssetManager.preLoadAssets(Object.values(TILES));
    await TileObject.loadTileObjectData(OBJECTS.TREE);
    await AssetManager.loadTileSetFile(TILESETS.TEST);

    // Load game
    await testGame.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });

    gameManager = new GameManager(testGame);
}

run();
