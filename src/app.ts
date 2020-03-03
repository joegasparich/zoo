import "pixi.js";
import 'pixi-tilemap';
import "pixi-layers";

import "./app.scss";

import { Game } from 'Game';
import AssetManager from "AssetManager";
import CONFIG from 'constants/config';

const registerPixiInspector = () => {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

// Instantiate app
const app = new PIXI.Application({
    width: CONFIG.WINDOW_WIDTH,
    height: CONFIG.WINDOW_HEIGHT,
    backgroundColor: CONFIG.BACKGROUND_COLOUR,
});
registerPixiInspector();

// create view in DOM
document.body.appendChild(app.view);

//Create game
const game = new Game(app);

// Load Assets
AssetManager.onLoadComplete(() => {
    // set up ticker
    app.ticker.add(game.update.bind(game));
    game.setup();
});
