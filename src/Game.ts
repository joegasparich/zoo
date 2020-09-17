import { AssetManager, InputManager, PhysicsManager, SceneManager } from "./managers";
import Mediator from "./Mediator";

import { registerPixiInspector } from "./helpers/util";
import { Canvas } from "ui/components";
import Camera from "Camera";
import MapGrid from "world/MapGrid";
import { Entity } from "entities";
import Vector from "vector";
import Graphics from "Graphics";
import { Config, GameEvent, Inputs, Layers } from "consts";
import ZooScene from "scenes/ZooScene";
import UIManager from "ui/UIManager";
import { createDude } from "helpers/entityGenerators";
import World from "world/World";

type DebugSettings = {
    showMapGrid: boolean;
    showPathfinding: boolean;
    showWallGrid: boolean;
    showPhysics: boolean;
    showElevation: boolean;
    showWater: boolean;
};

const defaultSettings: DebugSettings = {
    showMapGrid: false,
    showPathfinding: false,
    showWallGrid: false,
    showPhysics: false,
    showElevation: false,
    showWater: false,
};

type GameOpts = {
    windowWidth?: number;
    windowHeight?: number;
    enableDebug?: boolean;
    worldScale?: number;
    gameSpeed?: number;
};

const defaultOpts: GameOpts = {
    windowWidth: 800,
    windowHeight: 600,
    enableDebug: false,
    worldScale: 16,
    gameSpeed: 1,
};

class Game {
    public app: PIXI.Application;
    public stage: PIXI.display.Stage;

    public opts: GameOpts;

    public canvas: Canvas;
    public camera: Camera;
    public map: MapGrid;
    public world: World;

    private entities: Map<string, Entity>;
    private entitiesToAdd: Entity[];
    private entitiesToDelete: string[];

    // Managers
    public input: InputManager;
    public physicsManager: PhysicsManager;
    public sceneManager: SceneManager;

    public debugSettings: DebugSettings;

    public constructor(opts: GameOpts) {
        this.opts = Object.assign(defaultOpts, opts);
        this.debugSettings = defaultSettings;

        // Set PIXI settings
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // Instantiate app
        this.app = new PIXI.Application({
            width: opts.windowWidth,
            height: opts.windowHeight,
            backgroundColor: 0x000000,
        });
        registerPixiInspector();

        // Set up variables
        this.entities = new Map();
        this.entitiesToAdd = [];
        this.entitiesToDelete = [];

        // create view in DOM
        document.body.appendChild(this.app.view);

        // create ui canvas
        this.canvas = new Canvas();
    }

    public async load(onProgress?: (progress: number) => void): Promise<void> {
        // Load Assets, all preloaded assets should be added to the manager at this point
        Mediator.fire(GameEvent.LOAD_START);
        await AssetManager.doPreLoad(onProgress);
        Mediator.fire(GameEvent.LOAD_COMPLETE);

        // Now that assets have been loaded we can set up the game
        await this.setup();

        // start up the game loop
        this.app.ticker.add(this.loop.bind(this));
    }

    protected setup(): void {
        this.input = new InputManager();
        this.physicsManager = new PhysicsManager();

        this.setupStage();

        this.canvas.load();

        this.camera = new Camera(new Vector(20, 20), 1);
        this.camera.scale = Config.CAMERA_SCALE;

        this.map = new MapGrid();

        this.physicsManager.setup();
        this.sceneManager = new SceneManager(this.map);
        this.sceneManager.loadScene(
            new ZooScene(),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );

        Graphics.init();

        // Register inputs
        Object.values(Inputs).forEach(input => {
            this.input.registerInput(input);
        });

        UIManager.setup();

        Mediator.fire(GameEvent.SETUP_COMPLETE);

        createDude();
    }

    private setupStage(): void {
        this.stage = new PIXI.display.Stage();
        this.stage.sortableChildren = true;

        this.stage.addChild(new PIXI.display.Layer(Layers.GROUND));
        this.stage.addChild(new PIXI.display.Layer(Layers.ENTITIES));
        this.stage.addChild(new PIXI.display.Layer(Layers.UI));
        this.stage.addChild(new PIXI.display.Layer(Layers.DEBUG));

        this.app.stage = this.stage;
    }

    /**
     * The main game loop.
     * @param delta ms since the last update
     */
    private loop(delta: number): void {
        delta *= this.opts.gameSpeed;

        this.preUpdate(delta);
        Mediator.fire(GameEvent.PRE_UPDATE, {delta, game: this});

        this.update(delta);
        Mediator.fire(GameEvent.UPDATE, {delta, game: this});

        this.postUpdate(delta);
        Mediator.fire(GameEvent.POST_UPDATE, {delta, game: this});

        // Reset tings
        this.input.clearKeys();
        this.pushCachedEntities();
        this.removeDeletedEntities();
    }

    protected preUpdate(delta: number): void {
        // Setup actions
        const scene = this.sceneManager.getCurrentScene();
        scene && scene.preUpdate();
        Graphics.preUpdate();
        this.entities.forEach(entity => {
            entity.preUpdate(delta);
        });
    }

    protected update(delta: number): void {
        // Game actions
        const scene = this.sceneManager.getCurrentScene();
        scene && scene.update();
        this.entities.forEach(entity => {
            entity.update(delta);
        });
        // Do Physics
        this.physicsManager.update(delta);
        UIManager.update(delta);
    }

    protected postUpdate(delta: number): void {
        // Rendering actions
        const scene = this.sceneManager.getCurrentScene();
        scene && scene.postUpdate();
        this.entities.forEach(entity => {
            entity.postUpdate(delta);
        });

        this.drawDebug();

        this.map.postUpdate();
        this.world.postUpdate(delta);
        Graphics.postUpdate();
        // ! Camera should be last to avoid stuttering
        this.camera.update();

        UIManager.postUpdate(delta);
    }

    public getEntities(): Entity[] {
        // TODO: Find out if its cheaper to also store an array of entities instead of converting it each time
        return Array.from(this.entities.values());
    }

    public registerEntity(entity: Entity): Entity {
        this.entitiesToAdd.push(entity);
        return entity;
    }

    public unregisterEntity(id: string): void {
        this.entitiesToDelete.push(id);
    }

    public clearEntities(): void {
        this.entities.forEach(entity => {
            entity.remove();
        });
        this.entities = new Map();
        this.entitiesToAdd = [];
        this.entitiesToDelete = [];
    }

    private pushCachedEntities(): void {
        this.entitiesToAdd.forEach(entity => {
            this.entities.set(entity.id, entity);
            entity.start();
        });
        this.entitiesToAdd = [];
    }

    private removeDeletedEntities(): void {
        this.entitiesToDelete.forEach(entityId => {
            this.entities.delete(entityId);
        });
        this.entitiesToDelete = [];
    }

    private drawDebug(): void {
        if (this.debugSettings.showMapGrid) this.map.drawDebug();
        if (this.debugSettings.showPathfinding) this.map.drawPathfinderDebug();
        if (this.debugSettings.showPhysics) this.physicsManager.drawDebug();
        if (this.debugSettings.showWallGrid) this.world.wallGrid.drawDebug();
        if (this.debugSettings.showElevation) this.world.elevationGrid.drawDebug();
        if (this.debugSettings.showWater) this.world.waterGrid.drawDebug();
    }
}

export default new Game({
    windowWidth: Config.WINDOW_WIDTH,
    windowHeight: Config.WINDOW_HEIGHT,
    enableDebug: Config.ENABLE_DEBUG,
    worldScale: 16,
});
