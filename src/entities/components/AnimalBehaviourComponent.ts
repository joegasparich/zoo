import { Entity } from "entities";
import { BehaviourData, createBehaviour, IdleBehaviour } from "entities/behaviours";
import Game from "Game";
import { StateMachine } from "state";
import Exhibit from "world/Exhibit";
import { COMPONENT, InputComponent, NeedsComponent, PathFollowComponent } from ".";
import { ComponentSaveData } from "./Component";

interface AnimalBehaviourComponentSaveData extends ComponentSaveData {
    behaviourData: BehaviourData;
}

export default class AnimalBehaviourComponent extends InputComponent {
    public id: COMPONENT = "ANIMAL_BEHAVIOUR_COMPONENT";
    public type: COMPONENT = "INPUT_COMPONENT";

    public requires: COMPONENT[] = ["NEEDS_COMPONENT", "PATH_FOLLOW_COMPONENT"];

    public pathfinder: PathFollowComponent;
    public needs: NeedsComponent;
    public stateMachine = new StateMachine(new IdleBehaviour());
    public exhibit: Exhibit;

    public start(entity: Entity): void {
        super.start(entity);

        this.pathfinder = entity.getComponent("PATH_FOLLOW_COMPONENT");
        this.needs = entity.getComponent("NEEDS_COMPONENT");

        const area = Game.world.getAreaAtPosition(entity.position);
        this.exhibit = Game.world.getExhibitByAreaId(area.id);
        if (!this.exhibit) {
            this.exhibit = Game.world.createExhibit(area.id);
        }
        this.exhibit.addAnimal(this.entity);
    }

    public update(delta: number): void {
        this.stateMachine.update(delta, this);
    }

    public end(): void {
        this.exhibit.removeAnimal(this.entity);
    }

    public save(): AnimalBehaviourComponentSaveData {
        return {
            ...super.save(),
            behaviourData: this.stateMachine.getState().save() as BehaviourData,
        };
    }

    public load(data: AnimalBehaviourComponentSaveData): void {
        super.load(data);

        const state = createBehaviour(data.behaviourData);
        state.load(data.behaviourData);

        this.stateMachine.setState(state);
    }
}
