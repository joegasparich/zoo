import Actor from "./Actor";
import { Game, Vector, SpriteSheet } from "engine";
import { PlayerInputSystem } from "./systems";
import { PhysicsSystem, CameraFollowSystem, AnimatedRenderSystem, SYSTEM } from "engine/entities/systems";
import { Animation } from "engine/entities/systems/AnimatedRenderSystem";
import { AssetManager } from "engine/managers";
import { SPRITESHEETS } from "constants/assets";

export default class Player extends Actor {
    private animator: AnimatedRenderSystem;

    constructor(game: Game, position: Vector) {
        const spritesheet = new SpriteSheet({
            image: AssetManager.getTexture(SPRITESHEETS.DUDE_RUN),
            cellHeight: 24,
            cellWidth: 24,
        });

        super(
            game,
            position,
            new PlayerInputSystem(),
            new PhysicsSystem(),
            new AnimatedRenderSystem([
                new Animation("idle", spritesheet.getTextures([0]), 0.25, false),
                new Animation("run", spritesheet.getTextures([1,2,3,4,5,6]), 0.25, true),
            ]),
        );
        this.addSystem(new CameraFollowSystem());
        this.animator = this.getSystem(SYSTEM.ANIMATED_RENDER_SYSTEM) as AnimatedRenderSystem;
        this.animator.setAnimation("idle");
    }

    postUpdate(delta: number): void {
        super.postUpdate(delta);

        if (this.input.inputVector.x > 0) {
            this.animator.flipX = false;
            this.animator.setAnimation("run");
        } else if (this.input.inputVector.x < 0) {
            this.animator.flipX = true;
        }

        if (this.input.inputVector.magnitude() > 0) {
            this.animator.setAnimation("run");
        } else {
            this.animator.setAnimation("idle");
        }
    }
}
