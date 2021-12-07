import { WorldEvent } from "consts";
import { Entity } from "entities";
import { BehaviourData, createBehaviour, IdleBehaviour } from "entities/behaviours";
import Game from "Game";
import { AssetManager } from "managers";
import Mediator from "Mediator";
import { StateMachine } from "state";
import { AnimalData } from "types/AssetTypes";
import Exhibit from "world/Exhibit";
import { ZOO_AREA } from "world/World";
import { COMPONENT, InputComponent, NeedsComponent, PathFollowComponent } from ".";
import { ComponentSaveData } from "./Component";

interface AnimalBehaviourComponentSaveData extends ComponentSaveData {
    assetPath: string;
    behaviourData: BehaviourData;
}

export default class AnimalBehaviourComponent extends InputComponent {
    public id: COMPONENT = "ANIMAL_BEHAVIOUR_COMPONENT";
    public type: COMPONENT = "INPUT_COMPONENT";

    public requires: COMPONENT[] = ["NEEDS_COMPONENT", "PATH_FOLLOW_COMPONENT"];

    public assetPath: string;
    public data: AnimalData;
    public pathfinder: PathFollowComponent;
    public needs: NeedsComponent;
    public stateMachine = new StateMachine(new IdleBehaviour());
    public exhibit?: Exhibit;

    private areaListener: string;

    public start(entity: Entity): void {
        super.start(entity);

        this.pathfinder = entity.getComponent("PATH_FOLLOW_COMPONENT");
        this.needs = entity.getComponent("NEEDS_COMPONENT");

        this.areaListener = Mediator.on(WorldEvent.AREAS_UPDATED, () => {
            this.findExhibit();
        });
        this.findExhibit();
    }

    public update(delta: number): void {
        this.stateMachine.update(delta, this);
    }

    public end(): void {
        this.exhibit?.removeAnimal(this.entity);

        Mediator.unsubscribe(WorldEvent.AREAS_UPDATED, this.areaListener);
    }

    public setAsset(assetPath: string): void {
        this.assetPath = assetPath;
        this.data = AssetManager.getJSON(assetPath) as AnimalData;
    }

    public findExhibit(): void {
        this.exhibit?.removeAnimal(this.entity);

        const area = Game.world.getAreaAtPosition(this.entity.position);
        if (area.id !== ZOO_AREA) {
            this.exhibit = Game.world.getExhibitByAreaId(area.id);
            if (!this.exhibit) {
                this.exhibit = Game.world.createExhibit(area.id);
            }
            this.exhibit.addAnimal(this.entity);
        } else {
            this.exhibit = undefined;
        }
    }

    public save(): AnimalBehaviourComponentSaveData {
        return {
            ...super.save(),
            assetPath: this.assetPath,
            behaviourData: this.stateMachine.getState().save() as BehaviourData,
        };
    }

    public load(data: AnimalBehaviourComponentSaveData): void {
        super.load(data);

        this.setAsset(data.assetPath);

        const state = createBehaviour(data.behaviourData);
        state.load(data.behaviourData);

        this.stateMachine.setState(state);
    }

    public printDebug(): void {
        super.printDebug();

        console.log(this.data);
        console.log(`Current state: ${this.stateMachine.getState().id}`);
        console.log(`Exhibit: ${this.exhibit.area.name}`);
    }
}
