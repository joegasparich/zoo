/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";

import { Assets } from "consts";
import { Button, DebugControls, FloatingPanel, BiomeControls } from "ui/components";
import ToolManager from "ui/ToolManager";
import { ToolType } from "ui/tools";
import UIManager from "ui/UIManager";
import { Vector } from "engine";
import AreaList from "./AreaList";
import { TileObjectData } from "types/AssetTypes";
import { AssetManager } from "engine/managers";

interface ToolbarProps extends UIComponentProps {
    toolManager: ToolManager;
}

interface ToolbarState {
    activeTool: ToolType;
    radius: number;
}
const defaultState: ToolbarState = {
    activeTool: 0,
    radius: 1,
};

export default class Toolbar extends UIComponent<ToolbarProps, ToolbarState> {

    public constructor(props: ToolbarProps) {
        super(props);

        this.state = defaultState;

        props.toolManager.radius = this.state.radius;
    }

    protected getStyles(): SerializedStyles {
        return css`
            pointer-events: none;
            width: 100%;
            height: 100%;
            background-color: transparent;
            position: absolute;

            .bar {
                pointer-events: all;
                background-color: #AAAAAA;
                top: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                width: 100%;
                height: 40px;
            }

            .panel-button {
                display: flex;
                justify-content: center;
            }

            .resize-panel {
                pointer-events: all;
                top: auto;
                bottom: 5px;
                right: 5px;

                .radius {
                    line-height: 30px;
                    width: 30px;
                    text-align: center;
                }
            }
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <div className="bar">
                    <Button
                        key="treeButton"
                        image={Assets.SPRITES.TREE}
                        onClick={(): void => {
                            this.setTool(
                                ToolType.TileObject,
                                {object: AssetManager.getJSON(Assets.OBJECTS.TREE) as TileObjectData},
                            );
                        }}
                    />
                    <Button
                        key="wallButton"
                        image={Assets.UI.IRON_BAR_FENCE}
                        onClick={(): void => {
                            this.setTool(ToolType.Wall);
                        }}
                    />
                    <Button
                        key="gateButton"
                        image={Assets.UI.IRON_BAR_GATE}
                        onClick={(): void => {
                            this.setTool(ToolType.Door);
                        }}
                    />
                    <Button
                        key="deleteButton"
                        image={Assets.UI.BIN_ICON}
                        onClick={(): void => {
                            this.setTool(ToolType.Delete);
                        }}
                    />
                    <Button
                        key="areasButton"
                        image={Assets.UI.AREAS_ICON}
                        onClick={(): void => {
                            UIManager.openWindow("areaList", "Areas", new Vector(0, 400), <AreaList />);
                        }}
                    />
                    <BiomeControls
                        setTool={this.setTool.bind(this)}
                    />
                    <Button
                        key="hillButton"
                        image={Assets.UI.ELEVATE_ICON}
                        onClick={(): void => {
                            this.setTool(ToolType.Elevation, { elevation: 1 });
                        }}
                    />
                    <Button
                        key="waterButton"
                        image={Assets.UI.WATER_ICON}
                        onClick={(): void => {
                            this.setTool(ToolType.Water, { elevation: -1 });
                        }}
                    />
                    <DebugControls />
                </div>
                <FloatingPanel
                    key="brushSize"
                    className="resize-panel"
                    hidden={!this.props.toolManager.showRadius()}
                    layout="horizontal"
                    showTriangle={false}
                >
                    <Button
                        key="decreaseButton"
                        onClick={(): void => {
                            const radius = Math.max(this.state.radius - 0.125, 0.5);
                            this.setState({radius: radius});
                            this.props.toolManager.radius = radius;
                        }}
                    >-</Button>
                    <span className="radius">{this.state.radius}</span>
                    <Button
                        key="increaseButton"
                        onClick={(): void => {
                            const radius = Math.min(this.state.radius + 0.125, 2.5);
                            this.setState({radius: radius});
                            this.props.toolManager.radius = radius;
                        }}
                    >+</Button>
                </FloatingPanel>
            </React.Fragment>
        );
    }


    private setTool(tool: ToolType, data?: Record<string, any>): void {
        this.setState({activeTool: tool});
        this.props.toolManager.setTool(tool, data);
    }
}
