import * as React from "react";

import { Game } from "engine";
import { Canvas } from "engine/ui";

import { Toolbar } from "./components";

export default class PlayUI {
    public game: Game;
    public canvas: Canvas;

    public constructor(game: Game) {
        this.game = game;
        this.canvas = game.canvas;

        this.loadUI();
    }

    public loadUI(): void {
        this.canvas.addChild(<Toolbar key="toolbar" />);
    }
}
