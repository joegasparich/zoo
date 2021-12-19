import { WorldEvent } from "consts";
import { Entity } from "entities";
import { Behaviour, BehaviourData, createBehaviour, IdleBehaviour } from "entities/behaviours";
import ConsumeBehaviour from "entities/behaviours/ConsumeBehaviour";
import Game from "Game";
import { randomInt } from "helpers/math";
import { AssetManager } from "managers";
import Mediator from "Mediator";
import React from "react";
import { StateMachine } from "state";
import { AnimalData, NeedType } from "types/AssetTypes";
import AnimalInfo from "ui/components/AnimalInfo";
import UIManager from "ui/UIManager";
import Vector from "vector";
import Exhibit from "world/Exhibit";
import { ZOO_AREA } from "world/World";
import { COMPONENT, InputComponent, InteractableComponent, NeedsComponent, PathFollowComponent } from ".";
import { ComponentSaveData } from "./Component";
import { InteractableEvents } from "./InteractableComponent";
import { randomItem } from "helpers/util";

import { names } from "../../consts/names.json";

const NEED_THRESHOLD = 50; // TODO: flesh this out
const STATE_UPDATE_INTERVAL_RANGE: [number, number] = [1000, 5000];

interface AnimalBehaviourComponentSaveData extends ComponentSaveData {
    assetPath: string;
    name: string;
    behaviourData: BehaviourData;
}

export default class AnimalBehaviourComponent extends InputComponent {
    public id: COMPONENT = "ANIMAL_BEHAVIOUR_COMPONENT";
    public type: COMPONENT = "INPUT_COMPONENT";

    public requires: COMPONENT[] = ["NEEDS_COMPONENT", "PATH_FOLLOW_COMPONENT", "INTERACTABLE_COMPONENT"];

    public pathfinder: PathFollowComponent;
    public needs: NeedsComponent;
    public interactable: InteractableComponent;

    public name: string;

    public assetPath: string;
    public data: AnimalData;
    public stateMachine = new StateMachine<Behaviour>(new IdleBehaviour());
    public exhibit?: Exhibit;

    private areaListener: string;
    private nextStateChange = 0;

    private mouseDownHandle: string;

    public start(entity: Entity): void {
        super.start(entity);

        this.pathfinder = entity.getComponent("PATH_FOLLOW_COMPONENT");
        this.needs = entity.getComponent("NEEDS_COMPONENT");
        this.interactable = entity.getComponent("INTERACTABLE_COMPONENT");

        this.mouseDownHandle = this.interactable.on(InteractableEvents.MouseDown, () => {
            UIManager.openWindow(
                `animal-${this.entity.id}`,
                `${this.name} the ${this.data.name}`,
                new Vector(200, 200),
                React.createElement(AnimalInfo, { animalId: this.entity.id }),
            );
        });

        this.areaListener = Mediator.on(WorldEvent.AREAS_UPDATED, () => {
            this.findExhibit();
        });
        this.findExhibit();

        if (!this.name) {
            this.name = randomItem(names);
        }
    }

    public update(delta: number): void {
        this.stateMachine.update(delta, this);

        if (Date.now() > this.nextStateChange) {
            this.checkForStateChange();
            this.nextStateChange = Date.now() + randomInt(...STATE_UPDATE_INTERVAL_RANGE);
        }
    }

    private checkForStateChange(): void {
        // TODO: Make this more dynamic to account for different animals having different available behaviours
        const priorityNeeds = this.needs.getNeedsByPriority();
        // TODO: Behaviour priorities?: this.stateMachine.getState().priority < Consume.priority
        if (priorityNeeds.length && this.stateMachine.getState().id !== "CONSUME") {
            for (let i = 0; i < priorityNeeds.length; i++) {
                const need = priorityNeeds[i];
                if (need.value < NEED_THRESHOLD && this.stateMachine.getState().id !== "CONSUME") {
                    if (
                        need.type === NeedType.Hunger
                            ? this.exhibit.findFoodOfType(this.data.diet).length
                            : this.exhibit.findConsumables(need.type).length
                    ) {
                        this.stateMachine.setState(new ConsumeBehaviour(need.type));
                        break;
                    }
                }
            }
        }
    }

    public end(): void {
        this.exhibit?.removeAnimal(this.entity);

        Mediator.unsubscribe(WorldEvent.AREAS_UPDATED, this.areaListener);
        this.interactable.unsubscribe(InteractableEvents.MouseDown, this.mouseDownHandle);
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
            // TODO: Handle escaped animals
            this.exhibit = undefined;
        }
    }

    public save(): AnimalBehaviourComponentSaveData {
        return {
            ...super.save(),
            assetPath: this.assetPath,
            name: this.name,
            behaviourData: this.stateMachine.getState().save() as BehaviourData,
        };
    }

    public load(data: AnimalBehaviourComponentSaveData): void {
        super.load(data);

        this.name = data.name;

        this.setAsset(data.assetPath);

        const state = createBehaviour(data.behaviourData);
        state.load(data.behaviourData);

        this.stateMachine.setState(state);
    }

    public printDebug(): void {
        super.printDebug();

        console.log(this.data);
        console.log(`Current state: ${this.stateMachine.getState().id}`);
        console.log(`Exhibit: ${this.exhibit?.name ?? "None"}`);
    }
}
