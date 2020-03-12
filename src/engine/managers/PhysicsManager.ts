import * as planck from "planck-js";

export default class PhysicsManager {
    public physicsWorld: planck.World

    public setup() {
        this.physicsWorld = planck.World();
    }

    public update(delta: number) {
        this.physicsWorld.step(delta);
    }
}