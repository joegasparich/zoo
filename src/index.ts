import { Game, Vector, AssetManager } from "engine";
import { PhysicsSystem, RenderSystem, CameraFollowSystem } from "engine/entities/systems";

import Actor from "entities/Actor";
import { PlayerInputSystem } from "entities/systems";

import CONFIG from "constants/config";
import { SPRITES, MAPS, TEXTURES, TILESETS } from "constants/assets";

// Create game
const testGame = new Game({
    windowWidth: CONFIG.WINDOW_WIDTH,
    windowHeight: CONFIG.WINDOW_HEIGHT,
    enableDebug: CONFIG.ENABLE_DEBUG
});

// Load Assets
AssetManager.loadAssets(Object.values(SPRITES));
AssetManager.loadAssets(Object.values(TEXTURES));
AssetManager.loadAssets(Object.values(TILESETS));
AssetManager.loadAssets(Object.values(MAPS));

// Set up game
testGame.load(() => {
    const player = new Actor(
        testGame,
        new Vector(300, 300),
        new PlayerInputSystem(),
        new PhysicsSystem(4),
        new RenderSystem(SPRITES.HERO)
    )
    testGame.registerEntity(player);
    player.addSystem(new CameraFollowSystem());

    Object.values(TILESETS).forEach(tileset => AssetManager.registerTileset(tileset))
    const map = AssetManager.getMap(MAPS.TEST);
    testGame.mapGrid.loadMap(map);
})
