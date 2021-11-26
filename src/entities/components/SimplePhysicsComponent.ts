import Vector from "vector";
import { COMPONENT, Component } from ".";

export default class SimplePhysicsComponent extends Component {
    public id: COMPONENT = "SIMPLE_PHYSICS_COMPONENT";
    public type: COMPONENT = "SIMPLE_PHYSICS_COMPONENT";

    private _velocity: Vector =  Vector.Zero();
    private _force: Vector =  Vector.Zero();

    public constructor(public mass = 50, public friction = 0.5) {
        super();
    }

    public preUpdate(delta: number): void {
        super.preUpdate(delta);
    }

    public update(delta: number): void {
        super.update(delta);

        // Move
        this.entity.position = this.entity.position.add(this._velocity);
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        // Add force
        this._velocity = this._velocity.add(this._force.multiply(delta/this.mass));
        // Apply dampening
        this._velocity = this._velocity.multiply(1 / (1 + delta * this.friction));

        this._force = Vector.Zero();
    }

    public addForce(force: Vector): void {
        this._force = this._force.add(force);
    }

    public getForce(): Vector {
        return this._force;
    }

    public get velocity(): Vector {
        return this._velocity;
    }

    // TODO: Serialize
}
