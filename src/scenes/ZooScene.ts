import Game from "Game";
import World from "world/World";
import UIManager from "ui/UIManager";
import { Scene } from "./Scene";
import MapGrid, { MapCell } from "world/MapGrid";
import Vector from "vector";
import { createDude } from "helpers/entityGenerators";
import { Assets, Side } from "consts";
import { Entity } from "entities";
import { RenderComponent } from "entities/components";
import Zoo from "Zoo";

const MAP_SIZE = 20;

export default class ZooScene extends Scene {
    public name = "Zoo Scene";

    public constructor() {
        super();
    }

    public start(): void {
        Game.map = new MapGrid();

        Game.zoo = new Zoo();
        this.generateMap();

        Game.zoo.start();

        createDude();
    }

    public update(delta: number): void {
        Game.world.update();
        Game.zoo.update();
    }

    public postUpdate(delta: number): void {
        Game.map.postUpdate();
        Game.world.postUpdate(delta);

        this.drawDebug();
    }

    public stop(): void {
        Game.clearEntities();
        Game.world.reset();
        Game.map.clearMap();
        UIManager.reset();

        Game.world = undefined;
        Game.map = undefined;
        Game.zoo = undefined;
    }

    private async generateMap(): Promise<void> {
        console.log("Generating Map");

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

        Game.zoo.entrance = new Entity(new Vector(MAP_SIZE / 2, 0));
        Game.zoo.entrance.addComponent(new RenderComponent(Assets.SPRITES.ENTRANCE, undefined, new Vector(0.5, 0.5)));
    }

    private drawDebug(): void {
        if (Game.debugSettings.showEntities) Game.getEntities().forEach(entity => entity.drawDebug());
        if (Game.debugSettings.showMapGrid) Game.map.drawDebug();
        if (Game.debugSettings.showPathfinding) Game.map.pathfindingGrid.drawDebug();
        if (Game.debugSettings.showWallGrid) Game.world.wallGrid.drawDebug();
        if (Game.debugSettings.showElevation) Game.world.elevationGrid.drawDebug();
        if (Game.debugSettings.showWater) Game.world.waterGrid.drawDebug();
        if (Game.debugSettings.showPath) Game.world.pathGrid.drawDebug();
    }
}
