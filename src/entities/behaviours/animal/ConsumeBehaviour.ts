import { Entity } from "entities";
import { AnimalBehaviourComponent } from "entities/components";
import { Need } from "entities/components/NeedsComponent";
import Game from "Game";
import { NeedType } from "types/AssetTypes";
import Vector from "vector";
import { BehaviourData, ANIMAL_BEHAVIOUR_STATE, IdleBehaviour } from ".";
import { Behaviour } from "..";

const CONSUME_SPEED = 0.1; // TODO: Make variable?

interface ConsumeData extends BehaviourData {
    needType: NeedType;
    targetId: string;
    isConsuming: boolean;
}

export default class ConsumeBehaviour implements Behaviour {
    public id: ANIMAL_BEHAVIOUR_STATE = "CONSUME";

    private target: Entity;
    private isConsuming: boolean;

    public constructor(private animal: AnimalBehaviourComponent, public needType?: NeedType) {}

    public exit(): void {
        this.animal.pathfinder?.clearPath();
    }

    public update(delta: number): void {
        // Eat snack
        if (this.isConsuming) {
            const need = this.animal.needs.getNeedByType(this.needType);
            const consumable = this.target.getComponent("CONSUMABLE_COMPONENT");

            need.value += consumable.consume(CONSUME_SPEED);

            if (need.value >= Need.MAX_NEED) {
                // Full
                need.value = Need.MAX_NEED;
                this.animal.stateMachine.setState(new IdleBehaviour(this.animal));
            }
            if (!this.target.exists) {
                // Snack finished
                this.animal.stateMachine.setState(new IdleBehaviour(this.animal));
            }

            return;
        }

        // Find snack
        if (!this.target && this.needType) {
            const consumables =
                this.needType === NeedType.Hunger
                    ? this.animal.exhibit.findFoodOfType(this.animal.data.diet)
                    : this.animal.exhibit.findConsumables(this.needType);

            this.target = consumables.reduce((prev, current) =>
                Vector.Distance(current.position, this.animal.entity.position) <
                Vector.Distance(prev.position, this.animal.entity.position)
                    ? current
                    : prev,
            );
            if (this.target) {
                this.animal.pathfinder.pathTo(this.target.position);
            }
        }

        // Move to snack
        if (this.target) {
            if (this.animal.pathfinder.followPath()) {
                this.animal.inputVector = Vector.Zero();
                this.isConsuming = true;
            } else {
                this.animal.inputVector =
                    this.animal.pathfinder.currentTarget?.subtract(this.animal.entity.position).normalize() ??
                    Vector.Zero();
            }
        }
    }

    public save(): ConsumeData {
        return {
            id: this.id,
            needType: this.needType,
            targetId: this.target.id,
            isConsuming: this.isConsuming,
        };
    }

    public load(data: ConsumeData): void {
        this.needType = data.needType;
        this.target = Game.getEntityById(data.targetId);
        this.isConsuming = data.isConsuming;
    }
}
