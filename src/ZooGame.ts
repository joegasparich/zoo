import { Game, Vector } from "engine";
import { AssetManager } from "engine/managers";
import Player from "entities/Player";
import TileObject from "entities/TileObject";

import { OBJECTS } from "constants/assets";
import { TileObjectData } from "types/AssetTypes";
import { PlacementGhost, PlayUI } from "ui";
import World from "world/World";
import Inputs from "constants/inputs";

export default class ZooGame extends Game {
    public world: World;
    public player: Player;

    private ghost: PlacementGhost;

    protected setup(): void {
        super.setup();

        // Register inputs
        Object.values(Inputs).forEach(input => {
            this.input.registerInput(input);
        });

        // Load Map
        this.world = new World(this);
        this.world.loadMap();

        // Create Player
        this.player = new Player(
            this,
            new Vector(4, 4),
        );
        this.player.render.scale = 0.5;

        this.ghost = new PlacementGhost(this);

        new PlayUI(this);
    }

    protected update(delta: number): void {
        super.update(delta);

        if (this.input.isInputPressed(Inputs.LeftMouse)) {
            const placePos: Vector = this.camera.screenToWorldPosition(this.input.getMousePos()).floor();

            this.placeTileObject(AssetManager.getJSON(OBJECTS.TREE) as TileObjectData, placePos);
        }

        if (this.input.isInputPressed(Inputs.RightMouse)) {
            const mousePos: Vector = this.camera.screenToWorldPosition(this.input.getMousePos());

            this.map.getPath(this.player.position.floor(), mousePos.floor(), {optimise: true})
                .then(path => {
                    if (!path) return;

                    this.player.pather.setPath(path);
                });
        }
    }

    public placeTileObject(object: TileObjectData, position: Vector): void {
        if (!this.world.isTileFree(position)) return;

        this.world.registerTileObject(new TileObject(
            this,
            position,
            object,
            true,
        ));
    }
}

