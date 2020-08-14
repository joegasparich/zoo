import { Game, Vector, SpriteSheet } from "engine";
import { PhysicsSystem, CameraFollowSystem, AnimatedRenderSystem, SYSTEM, PathFollowSystem, WallAvoidanceSystem } from "engine/entities/systems";
import { Animation } from "engine/entities/systems/AnimatedRenderSystem";
import { AssetManager, PhysicsManager } from "engine/managers";

import Actor from "./Actor";
import { AreaPathFollowSystem, PlayerInputSystem } from "./systems";
import { Assets } from "consts";

export default class Player extends Actor {
    private animator: AnimatedRenderSystem;
    public pather: PathFollowSystem;
    public wallAvoid: WallAvoidanceSystem;

    public constructor(game: Game, position: Vector) {
        const spritesheet = new SpriteSheet({
            image: AssetManager.getTexture(Assets.SPRITESHEETS.DUDE_RUN),
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
                new Animation("idle", spritesheet.getTexturesById([0]), 0.25, false),
                new Animation("run", spritesheet.getTexturesById([1,2,3,4,5,6]), 0.25, true),
            ], undefined, new Vector(0.5, 1)),
        );
        this.addSystem(new CameraFollowSystem());
        this.pather = this.addSystem(new AreaPathFollowSystem());
        this.wallAvoid = this.addSystem(new WallAvoidanceSystem());
        this.animator = this.getSystem(SYSTEM.ANIMATED_RENDER_SYSTEM) as AnimatedRenderSystem;
    }

    public start(): void {
        super.start();

        this.animator.setAnimation("idle");
    }

    public update(delta: number): void {
        super.update(delta);

        if (this.pather.hasPath()) {
            this.pather.followPath(this.accelleration);
            this.wallAvoid.shouldAvoid = true;
        } else {
            this.wallAvoid.shouldAvoid = false;
        }
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
