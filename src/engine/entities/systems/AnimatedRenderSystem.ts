import { Vector } from "engine";
import { RenderSystem, SYSTEM } from ".";

export class Animation {
    public name: string;
    public textures: PIXI.Texture[];
    public speed: number;
    public loop: boolean;

    public constructor(name: string, textures: PIXI.Texture[], speed = 0.25, loop = true) {
        this.name = name;
        this.textures = textures;
        this.speed = speed;
        this.loop = loop;
    }
}

export default class AnimatedRenderSystem extends RenderSystem {
    public id = SYSTEM.ANIMATED_RENDER_SYSTEM;

    private animations: Map<string, Animation>;
    private currentAnimation: Animation;

    public constructor(animations: Animation[], layer?: PIXI.display.Group, pivot?: Vector) {
        super(null, layer, pivot);

        this.animations = new Map();

        animations.forEach(animation => this.animations.set(animation.name, animation));
    }

    public setAnimation(key: string): void {
        if (!this.hasStarted) {
            console.error("System hasn't been started yet");
            return;
        }
        if (!this.animations.has(key)) {
            console.error("Tried to play nonexistent animation " + key);
        }
        if (this.currentAnimation?.name === key) {
            return;
        }

        const animation = this.animations.get(key);
        const animatedSprite = new PIXI.AnimatedSprite(animation.textures);
        animatedSprite.animationSpeed = animation.speed;
        animatedSprite.loop = animation.loop;

        this.currentAnimation = animation;
        this.setSprite(animatedSprite);

        animatedSprite.play();
    }
}
