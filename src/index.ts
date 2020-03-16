import { Game, Vector } from "engine";
import { AssetManager } from "engine/managers";
import { PhysicsSystem, RenderSystem, CameraFollowSystem } from "engine/entities/systems";

import Actor from "entities/Actor";
import { PlayerInputSystem } from "entities/systems";

import CONFIG from "constants/config";
import { SPRITES, MAPS, TEXTURES } from "constants/assets";
import { MapData } from "engine/map";

// Create game
const testGame = new Game({
    windowWidth: CONFIG.WINDOW_WIDTH,
    windowHeight: CONFIG.WINDOW_HEIGHT,
    enableDebug: CONFIG.ENABLE_DEBUG
});

// Load Assets
AssetManager.loadAssets(Object.values(SPRITES));
AssetManager.loadAssets(Object.values(TEXTURES));

// Set up game
let time = Date.now();
testGame.load(async () => {
    console.info(`Game Load took ${Date.now() - time}ms`)

    // Load Map
    time = Date.now();
    const map = await AssetManager.loadMap(MAPS.TEST)
    testGame.mapGrid.loadMap(map);
    console.info(`Map Load took ${Date.now() - time}ms`)

    // Create Player
    const player = new Actor(
        testGame,
        new Vector(4, 4),
        new PlayerInputSystem(),
        new PhysicsSystem(),
        new RenderSystem(SPRITES.HERO)
    )
    testGame.registerEntity(player);
    player.addSystem(new CameraFollowSystem());
})
