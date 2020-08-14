

import { Game, Vector } from "engine";
import Player from "entities/Player";
import TileObject from "entities/TileObject";

import { TileObjectData } from "types/AssetTypes";
import World from "world/World";
import { Config, Inputs } from "consts";
import { AssetManager } from "engine/managers";
import ToolManager from "ui/ToolManager";

type DebugSettings = {
    showMapGrid: boolean;
    showPathfinding: boolean;
    showWallGrid: boolean;
    showPhysics: boolean;
    showAreas: boolean;
};

const defaultSettings: DebugSettings = {
    showMapGrid: false,
    showPathfinding: false,
    showWallGrid: false,
    showPhysics: false,
    showAreas: false,
};

export default class ZooGame extends Game {
    public world: World;
    public player: Player;

    private tools: ToolManager;
    public debugSettings: DebugSettings;

    protected async setup(): Promise<void> {
        super.setup();

        this.debugSettings = defaultSettings;

        // Load Map
        this.world = new World(this);
        await this.world.setup();

        // Register inputs
        Object.values(Inputs).forEach(input => {
            this.input.registerInput(input);
        });

        this.camera.scale = Config.CAMERA_SCALE;

        // Create Player
        this.player = this.registerEntity(new Player(
            this,
            new Vector(4, 4),
        )) as Player;
        this.player.render.scale = 0.5;

        this.createUI();
    }

    private createUI(): void {
        this.tools = new ToolManager(this);
    }

    protected update(delta: number): void {
        super.update(delta);

        this.pollInput();

        this.tools.update();
        this.world.postUpdate(delta);
    }

    protected postUpdate(delta: number): void {
        this.tools.postUpdate();

        this.drawDebug();

        super.postUpdate(delta);
    }

    private pollInput(): void {
        if (this.tools.hasFocus()) return;

        if (this.input.isInputPressed(Inputs.RightMouse)) {
            const mousePos: Vector = this.camera.screenToWorldPosition(this.input.getMousePos());

            this.player.pather.pathTo(mousePos.floor());
        }
    }

    public placeTileObject(object: (TileObjectData | string), position: Vector): void {
        if (!this.world.isTileFree(position)) return;

        if (typeof object === "string") {
            object = AssetManager.getJSON(object) as TileObjectData;
        }

        this.world.registerTileObject(new TileObject(
            this,
            position,
            object,
            true,
        ));
    }

    private drawDebug(): void {
        if (this.debugSettings.showMapGrid) this.map.drawDebug();
        if (this.debugSettings.showPathfinding) this.map.drawPathfinderDebug();
        if (this.debugSettings.showPhysics) this.physicsManager.drawDebug();
        if (this.debugSettings.showWallGrid) this.world.wallGrid.drawDebug();
        if (this.debugSettings.showAreas) this.world.drawDebugAreas();
    }
}

