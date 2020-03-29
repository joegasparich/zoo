import { Game, Vector } from "engine";

import CONFIG from "constants/config";
import { SPRITES, TILES, SPRITESHEETS, TILESETS } from "constants/assets";
import Player from "entities/Player";
import { AssetManager } from "engine/managers";
import IslandScene from "scenes/IslandScene";


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
    await AssetManager.loadTileSetFile(TILESETS.TEST);

    // Load game
    await testGame.load(progress => {
        console.log(`Game Load Progress: ${progress}%`);
    });

    // Load Map
    await testGame.sceneManager.loadScene(
        new IslandScene(),
        (progress: number) => {
            console.log(`Map Load Progress: ${progress}%`);
        },
    );

    // Create Player
    const player = new Player(
        testGame,
        new Vector(4, 4),
    );
}

run();
