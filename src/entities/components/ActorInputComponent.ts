import { InputComponent, PathFollowComponent, COMPONENT, WallAvoidanceComponent } from "entities/components";
import { Entity } from "entities";
import Game from "Game";
import { Inputs } from "consts";
import Vector from "vector";
import UIManager from "ui/UIManager";

export default class ActorInputComponent extends InputComponent {
    public id: COMPONENT = "ACTOR_INPUT_COMPONENT";
    public type: COMPONENT = "INPUT_COMPONENT";
    public requires: COMPONENT[] = ["PATH_FOLLOW_COMPONENT"];

    private pathfinder: PathFollowComponent;
    private wallAvoid: WallAvoidanceComponent;

    public start(entity: Entity): void {
        super.start(entity);

        this.pathfinder = entity.getComponent("PATH_FOLLOW_COMPONENT");
        this.wallAvoid = entity.getComponent("WALL_AVOIDANCE_COMPONENT");
    }

    public update(delta: number): void {
        super.update(delta);

        this.inputVector = this.pathfinder.currentTarget?.subtract(this.entity.position).normalize() ?? Vector.Zero();

        if (this.wallAvoid) {
            if (this.pathfinder.hasPath()) {
                this.pathfinder.followPath(50);
                this.wallAvoid.shouldAvoid = true;
            } else {
                this.wallAvoid.shouldAvoid = false;
            }
        }

        // ! Temp
        if (Game.input.isInputPressed(Inputs.RightMouse) && !UIManager.hasFocus()) {
            const mousePos: Vector = Game.camera.screenToWorldPosition(Game.input.getMousePos());

            this.pathfinder.pathTo(mousePos.floor());
        }
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        // TODO: Move to a new component
        // if (this.inputVector.x > 0) {
        //     this.renderer.flipX = false;
        //     // this.animator.setAnimation("run");
        // } else if (this.inputVector.x < 0) {
        //     this.renderer.flipX = true;
        // }
    }
}
