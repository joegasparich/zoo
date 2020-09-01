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

interface BiomeControlsProps extends UIComponentProps {
    setTool: (tool: ToolType, data?: Object) => void;
};
interface BiomeControlsState {
    panelOpen: boolean;
};
const defaultState: BiomeControlsState = {
    panelOpen: false,
};

export default class BiomeControls extends UIComponent<BiomeControlsProps, BiomeControlsState> {

    public focusID = "BIOME_TOOLS";

    private focusListener: string;
    private unfocusListener: string;

    public constructor(props: BiomeControlsProps) {
        super(props);

        this.state = defaultState;

        this.focusListener = Mediator.on(UIEvent.FOCUS, ({id}: {id: string}) => {
            if (id !== this.focusID) {
                this.setState({panelOpen: false});
            }
        });
        this.unfocusListener = Mediator.on(UIEvent.UNFOCUS, () => this.setState({panelOpen: false}));
    }

    public componentWillUnmount(): void {
        Mediator.unsubscribe(UIEvent.FOCUS, this.focusListener);
        Mediator.unsubscribe(UIEvent.UNFOCUS, this.unfocusListener);
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
