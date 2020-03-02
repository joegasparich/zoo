import { Application } from 'pixi.js';

import "./app.scss";

import { Game } from 'Game';
import AssetManager from "AssetManager";
import CONFIG from 'constants/config';

// Instantiate app
const app = new Application({
    width: CONFIG.WINDOW_WIDTH,
    height: CONFIG.WINDOW_HEIGHT,
    backgroundColor: CONFIG.BACKGROUND_COLOUR,
});

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
