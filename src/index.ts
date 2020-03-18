import { Game, Vector } from "engine";
import { AssetManager } from "engine/managers";

import CONFIG from "constants/config";
import { SPRITES, TEXTURES } from "constants/assets";
import TestScene from "scenes/TestScene";
import Player from "entities/Player";

// Create game
const testGame = new Game({
    windowWidth: CONFIG.WINDOW_WIDTH,
    windowHeight: CONFIG.WINDOW_HEIGHT,
    enableDebug: CONFIG.ENABLE_DEBUG,
});

// Load Assets
AssetManager.loadAssets(Object.values(SPRITES));
AssetManager.loadAssets(Object.values(TEXTURES));

// Set up game
testGame.load(async () => {
    // Load Map
    await testGame.sceneManager.loadScene(new TestScene());

    // Create Player
    const player = new Player(
        testGame,
        new Vector(4, 4),
    );
});
