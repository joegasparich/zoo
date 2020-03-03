import { SPRITES } from "constants/assets";

import Entity from "entities/Entity";
import InputManager from "InputManager";
import { PhysicsSystem, RenderSystem } from "entities/systems";
import Actor from "entities/Actor";
import Vector from "types/vector";
import PlayerInputSystem from "entities/systems/PlayerInputSystem";
import MapGrid from "MapGrid";
import LAYERS from "constants/LAYERS";
import Debug from "Debug";

export class Game {
    private app: PIXI.Application;
    public stage: PIXI.display.Stage;

    private mapGrid: MapGrid;

    private entities: Map<string, Entity>
    private entitiesToAdd: Entity[];
    private entitiesToDelete: string[];

    // Managers
    public inputManager: InputManager;

    constructor(app: PIXI.Application) {
        this.app = app;

        // Set up variables
        this.entities = new Map();
        this.entitiesToAdd = [];
        this.entitiesToDelete = [];
    }

    public setup(): void {
        //Instantiate Managers
        this.inputManager = new InputManager();

        this.setupLayers();

        Debug.init(this);

        // Test //
        this.registerEntity(new Actor(
            this,
            new Vector(300, 300),
            new PlayerInputSystem(),
            new PhysicsSystem(4),
            new RenderSystem(SPRITES.HERO)
        ));
        this.pushCachedEntities();
        // End Test //

        this.mapGrid = new MapGrid(this, 15, 20);

        this.entities.forEach(entity => {
            entity.start();
        });
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
        });
    }

    private removeDeletedEntities(): void {
        this.entitiesToDelete.forEach(entityId => {
            this.entities.delete(entityId)
        });
    }

    public getApp(): PIXI.Application {
        return this.app;
    }
}