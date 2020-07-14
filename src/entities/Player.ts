import Actor from "./Actor";
import { Game, Vector, SpriteSheet } from "engine";
import { PlayerInputSystem } from "./systems";
import { PhysicsSystem, CameraFollowSystem, AnimatedRenderSystem, SYSTEM, PathFollowSystem, WallAvoidanceSystem } from "engine/entities/systems";
import { Animation } from "engine/entities/systems/AnimatedRenderSystem";
import { AssetManager, PhysicsManager } from "engine/managers";
import { SPRITESHEETS } from "constants/assets";

export default class Player extends Actor {
    private animator: AnimatedRenderSystem;
    public pather: PathFollowSystem;

    public constructor(game: Game, position: Vector) {
        const spritesheet = new SpriteSheet({
            image: AssetManager.getTexture(SPRITESHEETS.DUDE_RUN),
            cellHeight: 24,
            cellWidth: 24,
        });

        super(
            game,
            position,
            new PlayerInputSystem(),
            new PhysicsSystem({
                type: PhysicsManager.ColliderType.Circle,
                radius: 0.15,
            }, true, 20),
            new AnimatedRenderSystem([
                new Animation("idle", spritesheet.getTextures([0]), 0.25, false),
                new Animation("run", spritesheet.getTextures([1,2,3,4,5,6]), 0.25, true),
            ]),
        );
        this.addSystem(new CameraFollowSystem());
        this.pather = this.addSystem(new PathFollowSystem());
        this.addSystem(new WallAvoidanceSystem());
        this.animator = this.getSystem(SYSTEM.ANIMATED_RENDER_SYSTEM) as AnimatedRenderSystem;
    }

    public start(): void {
        super.start();

        this.animator.setAnimation("idle");
    }

    public update(delta: number): void {
        super.update(delta);

        this.pather.followPath(this.accelleration);
    }

    public postUpdate(delta: number): void {
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
