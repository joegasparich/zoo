import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from ".";
import Game from "Game";
import Exhibit from "world/Exhibit";
import { Biome } from "world/BiomeGrid";

const EXHIBIT_UPDATE_INTERVAL = 1000;

interface ExhibitInfoProps extends UIComponentProps {
    areaId: string;
}

interface ExhibitInfoState {
    exhibit: Exhibit;
}
const defaultState: ExhibitInfoState = {
    exhibit: undefined,
};

export default class ExhibitInfo extends UIComponent<ExhibitInfoProps, ExhibitInfoState> {

    private updateIntervalHandle: number;

    public constructor(props: ExhibitInfoProps) {
        super(props);

        this.state = defaultState;

        this.updateIntervalHandle = window.setInterval(this.updateExhibit.bind(this), EXHIBIT_UPDATE_INTERVAL);
    }

    public componentDidMount(): void {
        this.updateExhibit();
    }
    public componentWillUnmount(): void {
        window.clearInterval(this.updateIntervalHandle);
    }

    private updateExhibit(): void {
        this.setState({
            exhibit: Game.world.getExhibitByAreaId(this.props.areaId),
        });
    }

    protected getStyles(): SerializedStyles {
        return css`
            min-width: 400px;
            background: #ddd;
            padding: 0 20px;
            overflow: auto;

            p, ul {
                margin: 0;
            }
        `;
    }

    protected getContent(): JSX.Element {
        if (!this.state.exhibit) return <div />;

        const exhibit = this.state.exhibit;

        return (
            <div className="exhibit">
                <p>Exhibit Name: {exhibit.area.name ?? ""}</p>
                <p>Animals</p>
                <ul>
                    {exhibit.animals.map(animal =>
                        <li key={animal?.id}>
                            {animal?.getComponent("ANIMAL_BEHAVIOUR_COMPONENT")?.data?.name}
                        </li>,
                    )}
                </ul>
                <p>{`Size: ${exhibit.size ?? "???"} Tiles`}</p>
                <p>Biomes:</p>
                <ul>
                    {Object.keys(exhibit.biomeDistribution).map(biome =>
                        <li key={biome}>
                            {Biome[+biome]}: {(exhibit.biomeDistribution[(+biome as Biome)] * 100).toFixed(2)}%
                        </li>,
                    )}
                </ul>
                <p>Foliage coverage: {(exhibit.foliage.length / exhibit.size * 100).toFixed(2)}%</p>
                <p>Hilliness: {(exhibit.hilliness * 100).toFixed(2)}%</p>
                <p>Water: {(exhibit.waterness * 100).toFixed(2)}%</p>
                <p
                    onMouseEnter={() => { exhibit.viewingAreaHighlighted = true; }}
                    onMouseLeave={() => { exhibit.viewingAreaHighlighted = false; }}
                >
                    Viewing Area
                </p>
            </div>
        );
    }
}
