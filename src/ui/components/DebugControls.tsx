/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";

import { Button, FloatingPanel } from "ui/components";
import { Assets } from "consts";
import Mediator from "engine/Mediator";
import { UIEvent } from "engine/consts/events";
import ZooGame from "ZooGame";

interface DebugProps extends UIComponentProps {
    game: ZooGame;
}
interface DebugState {
    panelOpen: boolean;
}
const defaultState: DebugState = {
    panelOpen: false,
};

export default class DebugControls extends UIComponent<DebugProps, DebugState> {

    public focusID = "DEBUG_CONTROLS";

    public constructor(props: DebugProps) {
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
                        id="debugButton"
                        key="debugButton"
                        image={Assets.UI.BIOME}
                        onClick={this.handlePanelButtonClick.bind(this)}
                    />
                    <FloatingPanel
                        key="panel"
                        className="panel"
                        hidden={!this.state.panelOpen}
                        layout="vertical"
                        showTriangle={true}
                    >
                        <Button
                            key="mapGridButton"
                            image={Assets.UI.GRASS}
                            onClick={(): void => { this.props.game.debugSettings.showMapGrid = !this.props.game.debugSettings.showMapGrid; }}
                        />
                        <Button
                            key="pathfindingButton"
                            image={Assets.UI.SNOW}
                            onClick={(): void => { this.props.game.debugSettings.showPathfinding = !this.props.game.debugSettings.showPathfinding; }}
                        />
                        <Button
                            key="physicsButton"
                            image={Assets.UI.SAND}
                            onClick={(): void => { this.props.game.debugSettings.showPhysics = !this.props.game.debugSettings.showPhysics; }}
                        />
                        <Button
                            key="wallButton"
                            image={Assets.UI.SAND}
                            onClick={(): void => { this.props.game.debugSettings.showWallGrid = !this.props.game.debugSettings.showWallGrid; }}
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
