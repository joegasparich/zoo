import { COMPONENT, Component } from ".";
import { ComponentSaveData } from "./Component";

export enum NeedType {
    Hunger,
    Thirst,
    Energy
}

export class Need {
    public static MAX_NEED = 100;

    public value = Need.MAX_NEED;

    public constructor(
        public type: NeedType,
        public change: number,
        public happinessMod: number,
        public canDie: boolean,
    ) {}

    public update(): void {
        if (this.value > Need.MAX_NEED) {
            this.value = Need.MAX_NEED;
        }
        this.value -= this.change;
    }
}

interface NeedsComponentSaveData extends ComponentSaveData {
    needs: {
        type: number;
        value: number;
        change: number;
        happinessMod: number;
        canDie: boolean;
    }[];
}

export default class NeedsComponent extends Component {
    public id: COMPONENT = "NEEDS_COMPONENT";
    public type: COMPONENT = "NEEDS_COMPONENT";

    public constructor(public needs?: Need[]) {
        super();
    }

    public update(): void {
        this.needs.forEach(need => need.update());
    }

    public getPriorityNeed(): Need {
        return this.needs.reduce((prev, curr) => prev.value < curr.value ? prev : curr);
    }

    public save(): NeedsComponentSaveData {
        return {
            ...super.save(),
            needs: this.needs,
        };
    }

    public load(data: NeedsComponentSaveData): void {
        super.load(data);

        this.needs = [];
        data.needs.forEach(needData => {
            const need = new Need(
                needData.type,
                needData.change,
                needData.happinessMod,
                needData.canDie,
            );
            need.value = needData.value;
            this.needs.push(need);
        });
    }

    public printDebug(): void {
        super.printDebug();

        console.group("Needs:");
        this.needs.forEach(need => {
            console.log(need);
        });
        console.groupEnd();
    }
}
