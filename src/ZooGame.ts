import { Game, Vector } from "engine";

import Player from "entities/Player";
import World from "world/World";
import { Config, Inputs } from "consts";
import UIManager from "ui/UIManager";
import SaveManager from "SaveManager";
import ZooScene from "scenes/ZooScene";

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
    public player: Player;

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
        if (UIManager.hasFocus()) return;

        // Test code
        if (this.input.isInputPressed(Inputs.RightMouse)) {
            const mousePos: Vector = this.camera.screenToWorldPosition(this.input.getMousePos());

            this.player.pather.pathTo(mousePos.floor());
        }
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
