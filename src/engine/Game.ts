import "pixi.js";
import "pixi-tilemap";
import "pixi-layers";

import "./app.scss";

import { Debug, Camera, Vector, Events, Layers } from ".";
import { AssetManager, InputManager, PhysicsManager, SceneManager } from "./managers";
import Mediator from "./Mediator";
import { Entity } from "./entities";
import { MapGrid } from "./map";

import { registerPixiInspector } from "./helpers/util";

type GameOpts = {
    windowWidth: number;
    windowHeight: number;
    enableDebug?: boolean;
};

export default class Game {

    public app: PIXI.Application;
    public stage: PIXI.display.Stage;

    private opts: GameOpts;

    public camera: Camera;
    public mapGrid: MapGrid;

    private entities: Map<string, Entity>;
    private entitiesToAdd: Entity[];
    private entitiesToDelete: string[];

    // Managers
    public physicsManager: PhysicsManager;
    public inputManager: InputManager;
    public sceneManager: SceneManager;

    constructor(opts: GameOpts) {
        this.opts = opts;

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
    }

    public async load(onProgress?: (progress: number) => void): Promise<void> {
        // Load Assets, all preloaded assets should be added to the manager at this point
        Mediator.fire(Events.GameEvent.LOAD_START);
        await AssetManager.doPreLoad(onProgress);
        Mediator.fire(Events.GameEvent.LOAD_COMPLETE);

        // start up the game loop
        this.app.ticker.add(this.update.bind(this));

        // Now that assets have been loaded we can set up the game
        this.setup();
    }

    private setup(): void {

        this.inputManager = new InputManager();
        this.physicsManager = new PhysicsManager();
        this.sceneManager = new SceneManager();

        this.setupRenderLayers();

        this.camera = new Camera(this, new Vector(20, 20));

        this.mapGrid = new MapGrid(this);
        this.mapGrid.setCamera(this.camera);

        this.physicsManager.setup();

        if (this.opts.enableDebug) {
            Debug.init(this);
        }

        Mediator.fire(Events.GameEvent.SETUP_COMPLETE);
    }

    private setupRenderLayers(): void {
        this.stage = new PIXI.display.Stage();
        this.stage.sortableChildren = true;

        this.stage.addChild(new PIXI.display.Layer(Layers.GROUND));
        this.stage.addChild(new PIXI.display.Layer(Layers.ENTITIES));
        this.stage.addChild(new PIXI.display.Layer(Layers.UI));
        this.stage.addChild(new PIXI.display.Layer(Layers.DEBUG));

        this.app.stage = this.stage;
    }

    public update(delta: number): void {
        //////////// Pre Update ////////////

        // Setup actions
        this.sceneManager.getCurrentScene().preUpdate();
        Debug.preUpdate();
        this.entities.forEach(entity => {
            entity.preUpdate(delta);
        });

        //////////// Update ////////////

        // Game actions
        this.sceneManager.getCurrentScene().update();
        this.entities.forEach(entity => {
            entity.update(delta);
        });
        // Do Physics
        this.physicsManager.update(delta);

        this.mapGrid.update(this);

        //////////// Post Update ////////////

        // Rendering actions
        this.sceneManager.getCurrentScene().postUpdate();
        this.entities.forEach(entity => {
            entity.postUpdate(delta);
        });

        this.camera.update();
        this.mapGrid.postUpdate();
        Debug.postUpdate();

        // Reset tings
        this.inputManager.clearKeys();
        this.pushCachedEntities();
        this.removeDeletedEntities();
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
