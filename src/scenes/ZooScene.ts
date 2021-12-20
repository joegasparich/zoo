import Game from "Game";
import World from "world/World";
import UIManager from "ui/UIManager";
import { Scene } from "./Scene";
import { MapCell } from "world/MapGrid";
import Vector from "vector";
import { createDude, createGuest } from "helpers/entityGenerators";
import { Assets, Side } from "consts";

const MAP_SIZE = 20;

export default class ZooScene extends Scene {
    public name = "Zoo Scene";

    public constructor() {
        super();
    }

    public start(): void {
        this.generateMap();

        createDude();
        createGuest(new Vector(5, 5));
    }

    public stop(): void {
        Game.clearEntities();
        Game.world.reset();
        Game.map.clearMap();
        UIManager.reset();
    }

    private async generateMap(): Promise<void> {
        const cells: MapCell[][] = [];

        // Place Grass
        for (let i = 0; i < MAP_SIZE; i++) {
            cells[i] = [];
            for (let j = 0; j < MAP_SIZE; j++) {
                cells[i][j] = {
                    position: new Vector(i, j),
                    isSolid: false,
                };
            }
        }

        // Load Map
        Game.map.setupGrid(cells);

        Game.world = new World();
        Game.world.setup();

        this.generateFence();

        Game.world.postSetup();
    }

    private generateFence(): void {
        for (let i = 0; i < Game.map.cols; i++) {
            Game.world.wallGrid.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(i, 0), Side.North, true);
            Game.world.wallGrid.placeWallAtTile(
                Assets.WALLS.IRON_BAR,
                new Vector(i, Game.map.rows - 1),
                Side.South,
                true,
            );
        }
        for (let i = 0; i < Game.map.rows; i++) {
            Game.world.wallGrid.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(0, i), Side.West, true);
            Game.world.wallGrid.placeWallAtTile(
                Assets.WALLS.IRON_BAR,
                new Vector(Game.map.cols - 1, i),
                Side.East,
                true,
            );
        }
    }
}
