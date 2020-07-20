import "pixi.js";
import "pixi-tilemap";
import "pixi-layers";

import "./app.scss";

import { Debug, Camera, Vector, Events, Layers } from ".";
import { AssetManager, InputManager, PhysicsManager, SceneManager } from "./managers";
import Mediator from "./Mediator";
import { Entity } from "./entities";
import { MapGrid } from "./map";
import { Canvas } from "./ui";

import { registerPixiInspector } from "./helpers/util";

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

export default class Game {
    public app: PIXI.Application;
    public stage: PIXI.display.Stage;

    public opts: GameOpts;

    public canvas: Canvas;
    public camera: Camera;
    public map: MapGrid;

    private entities: Map<string, Entity>;
    private entitiesToAdd: Entity[];
    private entitiesToDelete: string[];

    // Managers
    public input: InputManager;
    public physicsManager: PhysicsManager;
    public sceneManager: SceneManager;

    public constructor(opts: GameOpts) {
        this.opts = Object.assign(defaultOpts, opts);

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
        this.canvas = new Canvas(this);
    }

    public async load(onProgress?: (progress: number) => void): Promise<void> {
        // Load Assets, all preloaded assets should be added to the manager at this point
        Mediator.fire(Events.GameEvent.LOAD_START);
        await AssetManager.doPreLoad(onProgress);
        Mediator.fire(Events.GameEvent.LOAD_COMPLETE);

        // start up the game loop
        this.app.ticker.add(this.loop.bind(this));

        // Now that assets have been loaded we can set up the game
        this.setup();
    }

    protected setup(): void {
        this.input = new InputManager(this);
        this.physicsManager = new PhysicsManager(this);

        this.setupStage();

        this.canvas.load();

        this.camera = new Camera(this, new Vector(20, 20), 1);

        this.map = new MapGrid(this);
        this.map.setCamera(this.camera);

        this.sceneManager = new SceneManager(this.map);

        this.physicsManager.setup();

        if (this.opts.enableDebug) {
            Debug.init(this);
        }

        Mediator.fire(Events.GameEvent.SETUP_COMPLETE);
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
        Mediator.fire(Events.GameEvent.PRE_UPDATE, {delta, game: this});

        this.update(delta);
        Mediator.fire(Events.GameEvent.UPDATE, {delta, game: this});

        this.postUpdate(delta);
        Mediator.fire(Events.GameEvent.POST_UPDATE, {delta, game: this});

        // Reset tings
        this.input.clearKeys();
        this.pushCachedEntities();
        this.removeDeletedEntities();
    }

    protected preUpdate(delta: number): void {
        // Setup actions
        const scene = this.sceneManager.getCurrentScene();
        scene && scene.preUpdate();
        Debug.preUpdate();
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

        this.map.update();
    }

    protected postUpdate(delta: number): void {
        // Rendering actions
        const scene = this.sceneManager.getCurrentScene();
        scene && scene.postUpdate();
        this.entities.forEach(entity => {
            entity.postUpdate(delta);
        });

        this.map.postUpdate();
        Debug.postUpdate();
        this.camera.update();
    }

    public registerEntity(entity: Entity): void {
        this.entitiesToAdd.push(entity);
    }

    public deleteEntity(id: string): void {
        this.entitiesToDelete.push(id);
    }

    private pushCachedEntities(): void {
        this.entitiesToAdd.forEach(entity => {
            this.entities.set(entity.id, entity);
            console.log("Creating entity");
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
}
