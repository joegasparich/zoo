import { RenderSystem, SYSTEM } from ".";

export class Animation {
    name: string;
    textures: PIXI.Texture[];
    speed: number;
    loop: boolean;

    constructor(name: string, textures: PIXI.Texture[], speed = 0.25, loop = true) {
        this.name = name;
        this.textures = textures;
        this.speed = speed;
        this.loop = loop;
    }
}

export default class AnimatedRenderSystem extends RenderSystem {
    id = SYSTEM.ANIMATED_RENDER_SYSTEM;

    private animations: Map<string, Animation>;
    private currentAnimation: Animation;

    constructor(animations: Animation[]) {
        super(null);

        this.animations = new Map();

        animations.forEach(animation => this.animations.set(animation.name, animation));
    }

    public setAnimation(key: string): void {
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
