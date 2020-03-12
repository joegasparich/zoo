import "pixi.js";
import 'pixi-tilemap';
import "pixi-layers";

import "./app.scss";

import { Debug, Camera, Vector } from ".";
import { AssetManager, InputManager, PhysicsManager } from "./managers";
import { Entity } from "./entities";
import { MapGrid } from "./map";

import { registerPixiInspector } from "./helpers/util";

import { LAYERS } from "./constants";

enum GameEvent {
    LOAD_START,
    LOAD_COMPLETE,
    SETUP_COMPLETE,
}

type GameOpts = {
    windowWidth: number,
    windowHeight: number,
    enableDebug?: boolean
}

export default class Game {

    public static GameEvent = GameEvent;

    public app: PIXI.Application;
    public stage: PIXI.display.Stage;

    private opts: GameOpts;

    public camera: Camera;
    public mapGrid: MapGrid;

    private eventListeners: { event: GameEvent, callback: Function }[];

    private entities: Map<string, Entity>
    private entitiesToAdd: Entity[];
    private entitiesToDelete: string[];

    // Managers
    public physicsManager: PhysicsManager;
    public inputManager: InputManager;

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
        this.eventListeners = [];
        this.entities = new Map();
        this.entitiesToAdd = [];
        this.entitiesToDelete = [];

        // create view in DOM
        document.body.appendChild(this.app.view);
    }

    public load(callback?: Function): void {
        // Load Assets, all assets should be added to the manager at this point
        this.fire(GameEvent.LOAD_START);
        AssetManager.doLoad(() => {
            this.fire(GameEvent.LOAD_COMPLETE);

            // start up the game loop
            this.app.ticker.add(this.update.bind(this));

            // Now that assets have been loaded we can set up the game
            this.setup();

            callback();
        });
    }

    private setup(): void {

        this.inputManager = new InputManager();
        this.physicsManager = new PhysicsManager();

        this.setupRenderLayers();

        this.camera = new Camera(this, new Vector(20, 20));

        this.mapGrid = new MapGrid(this);
        this.mapGrid.setCamera(this.camera);

        this.physicsManager.setup();

        if (this.opts.enableDebug) {
            Debug.init(this);
        }

        this.fire(GameEvent.SETUP_COMPLETE);
    }

    private setupRenderLayers(): void {
        this.stage = new PIXI.display.Stage();
        this.stage.sortableChildren = true;

        this.stage.addChild(new PIXI.display.Layer(LAYERS.GROUND));
        this.stage.addChild(new PIXI.display.Layer(LAYERS.ENTITIES));
        this.stage.addChild(new PIXI.display.Layer(LAYERS.UI));
        this.stage.addChild(new PIXI.display.Layer(LAYERS.DEBUG));

        this.app.stage = this.stage;
    }

    public update(delta: number): void {
        //////////// Pre Update ////////////

        // Setup actions
        Debug.preUpdate();
        this.entities.forEach(entity => {
            entity.preUpdate(delta);
        });

        //////////// Update ////////////

        // Game actions
        this.entities.forEach(entity => {
            entity.update(delta);
        });
        // Do Physics
        this.physicsManager.update(delta);

        this.mapGrid.update(this);

        //////////// Post Update ////////////

        // Rendering actions
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
            this.entities.delete(entityId)
        });
        this.entitiesToDelete = [];
    }

    //-- Events --//

    public on(event: GameEvent, callback: Function): void {
        this.eventListeners.push({ event, callback })
    }

    private fire(event: GameEvent): void {
        console.log(`GAME EVENT: ${event.toString()}`);

        this.eventListeners
            .filter(listener => listener.event === event)
            .forEach(listener => listener.callback());
    }
}
