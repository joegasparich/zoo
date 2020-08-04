/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";

import { Button } from "ui/components";
import { Assets } from "consts";
import FloatingPanel from "./FloatingPanel";
import { Biome } from "world/BiomeGrid";
import Mediator from "engine/Mediator";
import { UIEvent } from "engine/consts/events";
import { ToolType } from "ui/tools";

interface BiomeToolsProps extends UIComponentProps {
    setTool: (tool: ToolType, data?: Object) => void;
};
interface BiomeToolsState {
    panelOpen: boolean;
};
const defaultState: BiomeToolsState = {
    panelOpen: false,
};

export default class BiomeTools extends UIComponent<BiomeToolsProps, BiomeToolsState> {

    public focusID = "BIOME_TOOLS";

    public constructor(props: BiomeToolsProps) {
        super(props);

        this.state = defaultState;

        Mediator.on(UIEvent.FOCUS, ({id}: {id: string}) => {
            if (id !== this.focusID) {
                this.setState({panelOpen: false});
            }
        });
        Mediator.on(UIEvent.UNFOCUS, () => this.setState({panelOpen: false}));
    }

    protected getStyles(): SerializedStyles {
        return css`
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <div className="panel-button">
                    <Button
                        key="biomeButton"
                        image={Assets.UI.BIOME}
                        onClick={this.handlePanelButtonClick.bind(this)}
                    />
                    <FloatingPanel
                        key="panel"
                        hidden={!this.state.panelOpen}
                        layout="horizontal"
                        showTriangle={true}
                    >
                        <Button
                            key="grassButton"
                            image={Assets.UI.GRASS}
                            onClick={(): void => { this.props.setTool(ToolType.Biome, {biome: Biome.Grass} ); }}
                        />
                        <Button
                            key="snowButton"
                            image={Assets.UI.SNOW}
                            onClick={(): void => { this.props.setTool(ToolType.Biome, {biome: Biome.Snow} ); }}
                        />
                        <Button
                            key="sandButton"
                            image={Assets.UI.SAND}
                            onClick={(): void => { this.props.setTool(ToolType.Biome, {biome: Biome.Sand} ); }}
                        />
                    </FloatingPanel>
                </div>
            </React.Fragment>
        );
    }

    private handlePanelButtonClick(): void {
        this.setState({panelOpen: !this.state.panelOpen});
        Mediator.fire(UIEvent.FOCUS, {id: this.focusID});
    }
}
