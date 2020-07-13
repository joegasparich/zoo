import { Game, Vector } from "engine";
import { GameEvent } from "engine/constants/events";
import { InputManager } from "engine/managers";
import Mediator from "engine/Mediator";
import Player from "entities/Player";
import World from "world/World";

export default class GameManager {

    game: Game;
    world: World;
    player: Player;

    constructor(game: Game) {
        this.game = game;

        this.setup();
    }

    private setup(): void {
        // Load Map
        this.world = new World(this.game);
        this.world.loadMap();

        // Create Player
        this.player = new Player(
            this.game,
            new Vector(4, 4),
        );

        this.player.render.scale = 0.5;

        // Register events
        Mediator.on(GameEvent.UPDATE, this.update.bind(this));
    }

    public update(): void {
        if (this.game.input.isMouseButtonPressed(InputManager.MOUSE_BUTTON.RIGHT)) {
            const mousePos: Vector = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

            this.game.map.getPath(this.player.position.floor(), mousePos.floor(), {optimise: true})
                .then(path => {
                    if (!path) return;

                    this.player.pather.setPath(path);
                });
        }
    }
}

