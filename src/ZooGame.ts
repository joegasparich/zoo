import { Game } from "engine";

import World from "world/World";
import { Config, Inputs } from "consts";
import UIManager from "ui/UIManager";
import ZooScene from "scenes/ZooScene";
import { createDude } from "helpers/entityGenerators";

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

class ZooGame extends Game {
    public world: World;

    public debugSettings: DebugSettings;

    protected async setup(): Promise<void> {
        super.setup();

        this.debugSettings = defaultSettings;

        // Register inputs
        Object.values(Inputs).forEach(input => {
            this.input.registerInput(input);
        });

        this.camera.scale = Config.CAMERA_SCALE;

        this.sceneManager.loadScene(
            new ZooScene(),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );

        this.registerEntity(createDude());

        UIManager.setup();
    }

    protected update(delta: number): void {
        super.update(delta);

        this.pollInput();

        UIManager.update(delta);
        this.world.postUpdate(delta);
    }

    protected postUpdate(delta: number): void {
        UIManager.postUpdate(delta);

        this.drawDebug();

        super.postUpdate(delta);
    }

    private pollInput(): void {
        // TODO: Move to input manager
        if (UIManager.hasFocus()) return;
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

export default new ZooGame({
    windowWidth: Config.WINDOW_WIDTH,
    windowHeight: Config.WINDOW_HEIGHT,
    enableDebug: Config.ENABLE_DEBUG,
    worldScale: 16,
});
