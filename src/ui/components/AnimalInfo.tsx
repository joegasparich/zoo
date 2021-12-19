import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from ".";
import Game from "Game";
import { Entity } from "entities";
import ProgressBar from "./ProgressBar";
import { Need } from "entities/components/NeedsComponent";
import { NeedType } from "types/AssetTypes";

const ANIMAL_UPDATE_INTERVAL = 1000;

const NeedColours: Record<NeedType, string> = {
    hunger: "#e09646",
    thirst: "#4c9aed",
    energy: "#e6d930",
};

interface AnimalInfoProps extends UIComponentProps {
    animalId: string;
    closeWindow?: () => void;
}

interface AnimalInfoState {
    animal: Entity;
}
const defaultState: AnimalInfoState = {
    animal: undefined,
};

export default class AnimalInfo extends UIComponent<AnimalInfoProps, AnimalInfoState> {
    private updateIntervalHandle: number;

    public constructor(props: AnimalInfoProps) {
        super(props);

        this.state = defaultState;

        this.updateIntervalHandle = window.setInterval(this.updateAnimal.bind(this), ANIMAL_UPDATE_INTERVAL);
    }

    public componentDidMount(): void {
        this.updateAnimal();
    }
    public componentWillUnmount(): void {
        window.clearInterval(this.updateIntervalHandle);
    }

    private updateAnimal(): void {
        const animal = Game.getEntityById(this.props.animalId);

        if (!animal?.exists) {
            this.props.closeWindow?.();
            return;
        }

        // Setting the state to the same animal will force a rerender
        this.setState({
            animal,
        });
    }

    protected getStyles(): SerializedStyles {
        return css`
            min-width: 400px;
            background: #ddd;
            padding: 0 20px;
            overflow: auto;

            p,
            ul {
                margin: 0;
            }

            .image {
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 5px;
                border: 1px solid black;
                background: white;
            }

            .need {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 5px 0 5px 24px; // TODO: Indent component?

                .need-label {
                    text-transform: capitalize;
                    margin-right: 5px;
                }
                .need-bar {
                    width: 75%;
                }
            }
        `;
    }

    protected getContent(): JSX.Element {
        if (!this.state.animal) {
            return <div />;
        }

        const { animal } = this.state;
        const animalComponent = animal.getComponent("ANIMAL_BEHAVIOUR_COMPONENT");

        return (
            <div className="animal">
                <img className="image" src={animalComponent.data.sprite} />
                <p>Species: {animalComponent.data.name}</p>
                <p>Scientific Name: {animalComponent.data.species}</p>
                <p>Class: {animalComponent.data.class}</p>
                <p>Needs: </p>
                {animalComponent.needs.needs.map(need => (
                    <div key={need.type} className="need">
                        <span className="need-label">{need.type}:</span>
                        <ProgressBar
                            percentage={need.value / Need.MAX_NEED}
                            colour={NeedColours[need.type]}
                            className="need-bar"
                        />
                    </div>
                ))}
            </div>
        );
    }
}
