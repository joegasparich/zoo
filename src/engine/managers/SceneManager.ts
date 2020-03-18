import Mediator from "engine/Mediator";
import AssetManager from "./AssetManager";
import { Events } from "engine";

export abstract class Scene {
    name: string;
    mapPath: string;

    start(): void {}
    preUpdate(): void {}
    update(): void {}
    postUpdate(): void {}
    stop(): void {}
}

export default class SceneManager {
    private currentScene: Scene;

    public async loadScene(scene: Scene, onProgress?: Function): Promise<void> {
        if (this.currentScene) {
            this.currentScene.stop();
        }

        this.currentScene = scene;

        scene.start();

        if (scene.mapPath) {
            Mediator.fire(Events.MapEvent.MAP_LOAD_START, { mapPath: scene.mapPath });
            const mapData = await AssetManager.loadMapData(scene.mapPath, onProgress);
            Mediator.fire(Events.MapEvent.MAP_LOAD_COMPLETE, mapData);
            Mediator.fire(Events.MapEvent.REQUEST_MAP_LOAD, mapData);
        }
    }

    public getCurrentScene(): Scene {
        return this.currentScene;
    }
}
