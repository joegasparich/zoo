import Mediator from "engine/Mediator";
import { Events } from "engine";
import { MapGrid } from "engine/map";
import { loadMapFile } from "engine/helpers/tiled";

export abstract class Scene {
    public name: string;
    public mapFile: string;

    public start(mapGrid: MapGrid): void {}
    public preUpdate(): void {}
    public update(): void {}
    public postUpdate(): void {}
    public stop(): void {}
}

export default class SceneManager {
    private currentScene: Scene;
    private mapGrid: MapGrid;

    public constructor(mapGrid: MapGrid) {
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
            const cells = await loadMapFile(scene.mapFile, onProgress);
            await this.mapGrid.setupGrid(cells, true);
            Mediator.fire(Events.MapEvent.MAP_LOAD_COMPLETE);
        }
    }

    public getCurrentScene(): Scene {
        return this.currentScene;
    }
}
