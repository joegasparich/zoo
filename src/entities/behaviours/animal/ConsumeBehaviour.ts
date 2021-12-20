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

    public constructor(public needType?: NeedType) {}

    public update(delta: number, animal: AnimalBehaviourComponent): void {
        // Eat snack
        if (this.isConsuming) {
            const need = animal.needs.getNeedByType(this.needType);
            const consumable = this.target.getComponent("CONSUMABLE_COMPONENT");

            need.value += consumable.consume(CONSUME_SPEED);

            if (need.value >= Need.MAX_NEED) {
                // Full
                need.value = Need.MAX_NEED;
                animal.stateMachine.setState(new IdleBehaviour());
            }
            if (!this.target.exists) {
                // Snack finished
                animal.stateMachine.setState(new IdleBehaviour());
            }

            return;
        }

        // Find snack
        if (!this.target && this.needType) {
            const consumables =
                this.needType === NeedType.Hunger
                    ? animal.exhibit.findFoodOfType(animal.data.diet)
                    : animal.exhibit.findConsumables(this.needType);

            this.target = consumables.reduce((prev, current) =>
                Vector.Distance(current.position, animal.entity.position) <
                Vector.Distance(prev.position, animal.entity.position)
                    ? current
                    : prev,
            );
            if (this.target) {
                animal.pathfinder.pathTo(this.target.position);
            }
        }

        // Move to snack
        if (this.target) {
            if (animal.pathfinder.followPath()) {
                animal.inputVector = Vector.Zero();
                this.isConsuming = true;
            } else {
                animal.inputVector =
                    animal.pathfinder.currentTarget?.subtract(animal.entity.position).normalize() ?? Vector.Zero();
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
