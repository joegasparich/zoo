import "pixi.js";
import 'pixi-tilemap';
import "pixi-layers";

import "./app.scss";

import { AssetManager, InputManager, Debug, Camera, Vector } from ".";
import { Entity } from "./entities";
import { MapGrid } from "./map";

import { registerPixiInspector } from "./helpers/util";

import { LAYERS } from "./constants";

enum GameEvent {
    LOAD_COMPLETE,
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
        // Load Assets
        AssetManager.doLoad(() => {
            // set up ticker
            this.app.ticker.add(this.update.bind(this));
            this.setup();
            callback();
        });
    }

    private setup(): void {

        //Instantiate Managers
        this.inputManager = new InputManager();

        this.setupLayers();

        this.camera = new Camera(this, new Vector(20, 20));
        this.mapGrid = new MapGrid(this);
        this.mapGrid.setCamera(this.camera);
        if (this.opts.enableDebug) {
            Debug.init(this);
        }

        this.fire(GameEvent.LOAD_COMPLETE);
    }

    private setupLayers(): void {
        this.stage = new PIXI.display.Stage();
        this.stage.sortableChildren = true;

        this.stage.addChild(new PIXI.display.Layer(LAYERS.GROUND));
        this.stage.addChild(new PIXI.display.Layer(LAYERS.ENTITIES));
        this.stage.addChild(new PIXI.display.Layer(LAYERS.UI));
        this.stage.addChild(new PIXI.display.Layer(LAYERS.DEBUG));

        this.app.stage = this.stage;
    }

    public update(delta: number): void {
        this.entities.forEach(entity => {
            entity.preUpdate(delta);
        });
        this.entities.forEach(entity => {
            entity.update(delta);
        });
        this.entities.forEach(entity => {
            entity.postUpdate(delta);
        });

        this.inputManager.clearKeys();
        this.pushCachedEntities();
        this.removeDeletedEntities();

        this.camera.update();
        this.mapGrid.update(this);
        Debug.update();
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

    public on(event: GameEvent, callback: Function): void {
        this.eventListeners.push({ event, callback })
    }

    private fire(event: GameEvent): void {
        this.eventListeners
            .filter(listener => listener.event === event)
            .forEach(listener => listener.callback());
    }
}
