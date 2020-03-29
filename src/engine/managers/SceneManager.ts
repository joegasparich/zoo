import Mediator from "engine/Mediator";
import { Events } from "engine";
import { MapGrid } from "engine/map";

export abstract class Scene {
    name: string;
    mapFile: string;

    start(mapGrid: MapGrid): void {}
    preUpdate(): void {}
    update(): void {}
    postUpdate(): void {}
    stop(): void {}
}

export default class SceneManager {
    private currentScene: Scene;
    private mapGrid: MapGrid;

    constructor(mapGrid: MapGrid) {
        this.mapGrid = mapGrid;
    }

    public async loadScene(scene: Scene, onProgress?: Function): Promise<void> {
        if (this.currentScene) {
            this.currentScene.stop();
        }

        this.currentScene = scene;

        scene.start(this.mapGrid);

        if (scene.mapFile) {
            Mediator.fire(Events.MapEvent.MAP_LOAD_START, { mapPath: scene.mapFile });
            await this.mapGrid.loadMapFile(scene.mapFile, onProgress);
            Mediator.fire(Events.MapEvent.MAP_LOAD_COMPLETE);
        }
    }

    public getCurrentScene(): Scene {
        return this.currentScene;
    }
}
