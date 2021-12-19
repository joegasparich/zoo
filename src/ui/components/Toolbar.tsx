/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { Assets } from "consts";
import { Button, DebugControls, FloatingPanel, UIComponent, UIComponentProps } from "ui/components";
import ToolManager from "ui/ToolManager";
import { ToolType } from "ui/tools";
import UIManager from "ui/UIManager";
import SaveManager from "managers/SaveManager";
import Vector from "vector";
import ExhibitList from "./ExhibitList";
import ExpandingPanel from "./ExpandingPanel";
import { Biome, BiomeIconMap } from "world/BiomeGrid";
import { EnumValues } from "helpers/util";
import { AssetManager } from "managers";
import { TileObjectData } from "types/AssetTypes";

interface ToolbarProps extends UIComponentProps {
    toolManager: ToolManager;
}

interface ToolbarState {
    activeButton: string;
    radius: number;
}
const defaultState: ToolbarState = {
    activeButton: "",
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
                background-color: #aaaaaa;
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
                        key="animalButton"
                        image={Assets.UI.ANIMAL_ICON}
                        active={this.state.activeButton === "animalButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Animal, { assetPath: Assets.ANIMALS.PLAINS_ZEBRA }, "animalButton");
                        }}
                    />
                    <Button
                        key="treeButton"
                        image={Assets.UI.FOLIAGE_ICON}
                        active={this.state.activeButton === "treeButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.TileObject, { assetPath: Assets.FOLIAGE.TREE }, "treeButton");
                        }}
                    />
                    <Button
                        key="buildingButton"
                        image={Assets.UI.BUILDING_ICON}
                        active={this.state.activeButton === "buildingButton"}
                        onClick={(): void => {
                            this.setTool(
                                ToolType.TileObject,
                                { assetPath: Assets.BUILDING.BUILDING },
                                "buildingButton",
                            );
                        }}
                    />
                    <ExpandingPanel
                        buttonIcon={Assets.UI.CONSUMABLE_ICON}
                        focusId="CONSUMABLES"
                        active={this.state.activeButton === "consumableButton"}
                        items={Object.values(Assets.CONSUMABLE).map((asset: string) => {
                            const data = AssetManager.getJSON(asset) as TileObjectData;
                            return {
                                image: data.sprite,
                                onClick: (): void => {
                                    this.setTool(ToolType.TileObject, { assetPath: asset }, "consumableButton");
                                },
                            };
                        })}
                    />
                    <Button
                        key="pathButton"
                        image={Assets.UI.PATH_ICON}
                        active={this.state.activeButton === "pathButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Path, { assetPath: Assets.PATHS.DIRT }, "pathButton");
                        }}
                    />
                    <Button
                        key="wallButton"
                        image={Assets.UI.IRON_BAR_FENCE}
                        active={this.state.activeButton === "wallButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Wall, {}, "wallButton");
                        }}
                    />
                    <Button
                        key="gateButton"
                        image={Assets.UI.IRON_BAR_GATE}
                        active={this.state.activeButton === "gateButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Door, {}, "gateButton");
                        }}
                    />
                    <Button
                        key="deleteButton"
                        image={Assets.UI.BIN_ICON}
                        active={this.state.activeButton === "deleteButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Delete, {}, "deleteButton");
                        }}
                    />
                    <ExpandingPanel
                        buttonIcon={Assets.UI.BIOME_ICON}
                        focusId="BIOME_TOOLS"
                        active={this.state.activeButton === "biomeButton"}
                        items={EnumValues(Biome).map((biome: Biome) => ({
                            image: BiomeIconMap[biome],
                            onClick: (): void => {
                                this.setTool(ToolType.Biome, { biome }, "biomeButton");
                            },
                        }))}
                    />
                    <Button
                        key="hillButton"
                        image={Assets.UI.ELEVATE_ICON}
                        active={this.state.activeButton === "hillButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Elevation, { elevation: 1, colour: 0xffff00 }, "hillButton");
                        }}
                    />
                    <Button
                        key="flattenButton"
                        image={Assets.UI.FLATTEN_ICON}
                        active={this.state.activeButton === "flattenButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Elevation, { elevation: 0, colour: 0xffff00 }, "flattenButton");
                        }}
                    />
                    <Button
                        key="waterButton"
                        image={Assets.UI.WATER_ICON}
                        active={this.state.activeButton === "waterButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Elevation, { elevation: -1, colour: 0x0000ff }, "waterButton");
                        }}
                    />
                    <Button
                        key="exhibitButton"
                        image={Assets.UI.EXHIBIT_ICON}
                        onClick={(): void => {
                            UIManager.openWindow("exhibitList", "Exhibits", new Vector(0, 400), <ExhibitList />);
                        }}
                    />
                    <DebugControls />
                    <Button
                        key="debugEntityButton"
                        image={Assets.UI.DEBUG_ENTITY_ICON}
                        active={this.state.activeButton === "debugEntityButton"}
                        onClick={(): void => {
                            this.setTool(ToolType.Debug, {}, "debugEntityButton");
                        }}
                    />
                    <Button
                        key="newButton"
                        image={Assets.UI.NEW_ICON}
                        onClick={(): void => {
                            SaveManager.newGame();
                        }}
                    />
                    <Button
                        key="saveButton"
                        image={Assets.UI.SAVE_ICON}
                        onClick={(): void => {
                            SaveManager.saveGame();
                        }}
                    />
                    <Button
                        key="loadButton"
                        image={Assets.UI.LOAD_ICON}
                        onClick={(): void => {
                            SaveManager.loadGame();
                        }}
                    />
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
                            this.setState({ radius: radius });
                            this.props.toolManager.radius = radius;
                        }}
                    >
                        -
                    </Button>
                    <span className="radius">{this.state.radius}</span>
                    <Button
                        key="increaseButton"
                        onClick={(): void => {
                            const radius = Math.min(this.state.radius + 0.125, 2.5);
                            this.setState({ radius: radius });
                            this.props.toolManager.radius = radius;
                        }}
                    >
                        +
                    </Button>
                </FloatingPanel>
            </React.Fragment>
        );
    }

    private setTool(tool: ToolType, data?: Record<string, any>, id?: string): void {
        this.setState({ activeButton: id });
        this.props.toolManager.setTool(tool, data);
    }
}
