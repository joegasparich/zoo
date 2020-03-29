import { Game, Vector } from "engine";

import CONFIG from "constants/config";
import { SPRITES, TILES, SPRITESHEETS, TILESETS, OBJECTS } from "constants/assets";
import Player from "entities/Player";
import { AssetManager } from "engine/managers";
import World from "world/World";
import TileObject from "entities/TileObject";

async function run() {
    // Create game
    const testGame = new Game({
        windowWidth: CONFIG.WINDOW_WIDTH,
        windowHeight: CONFIG.WINDOW_HEIGHT,
        enableDebug: CONFIG.ENABLE_DEBUG,
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

    // Load Map
    const world = new World(testGame);
    world.loadMap();

    // Create Player
    const player = new Player(
        testGame,
        new Vector(4, 4),
    );
}

run();
