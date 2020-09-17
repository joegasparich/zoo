import { Scene } from "scenes/Scene";
import MapGrid from "world/MapGrid";

export default class SceneManager {
    private currentScene: Scene;
    private mapGrid: MapGrid;

    public constructor(mapGrid: MapGrid) {
        this.mapGrid = mapGrid;
    }

    public loadScene(scene: Scene, onProgress?: Function): void {
        if (this.currentScene) {
            console.log("Stopping scene:", this.currentScene.name);
            this.currentScene.stop();
        }

        this.currentScene = scene;

        console.log("Starting scene:", scene.name);
        scene.start(this.mapGrid);
    }

    public getCurrentScene(): Scene {
        return this.currentScene;
    }
}
