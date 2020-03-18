import Actor from "./Actor";
import { Game, Vector } from "engine";
import { PlayerInputSystem } from "./systems";
import { PhysicsSystem, RenderSystem, CameraFollowSystem } from "engine/entities/systems";
import { SPRITES } from "constants/assets";

export default class Player extends Actor {
    constructor(game: Game, position: Vector) {
        super(
            game,
            position,
            new PlayerInputSystem(),
            new PhysicsSystem(),
            new RenderSystem(SPRITES.HERO),
        );
        this.addSystem(new CameraFollowSystem());
    }
}
