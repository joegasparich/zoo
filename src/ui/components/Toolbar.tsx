/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { Debug, Vector } from "engine";
import { UIComponent, UIComponentProps } from "engine/ui";
import { AssetManager } from "engine/managers";
import { Side } from "engine/consts";

import { Button } from "ui/components";
import { PlacementGhost } from "ui";
import ZooGame from "ZooGame";
import { Inputs, Config, Assets } from "consts";
import { TileObjectData, WallData } from "types/AssetTypes";
import { Biome } from "world/BiomeGrid";
import FloatingPanel from "./FloatingPanel";
import Wall from "world/Wall";

enum Tool {
    None,
    Tree,
    Wall,
    Biome,
}

interface ToolbarState {
    activeButton: string;
    activeTool: Tool;
    radius: number;
}
const defaultState: ToolbarState = {
    activeButton: "",
    activeTool: 0,
    radius: 1,
};

export default class Toolbar extends UIComponent<UIComponentProps, ToolbarState> {

    private game: ZooGame;

    private ghost: PlacementGhost;

    private currentBiome: Biome;
    private currentWall: WallData;

    private startWallPos: {pos: Vector; quadrant: Side};
    private wallGhosts: PlacementGhost[];
    private isDragging: boolean;

    public constructor(props: UIComponentProps) {
        super(props);

        this.state = defaultState;
    }

    protected getStyles(): SerializedStyles {
        return css`
            pointer-events: none;
            width: 100%;
            height: 100%;
            background-color: transparent;

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
                        onClick={(): void => { this.setTool(Tool.Tree); }}
                    />
                    <Button
                        key="wallButton"
                        image={Assets.UI.IRON_BAR_FENCE}
                        onClick={(): void => { this.setTool(Tool.Wall); }}
                    />
                    <div className="panel-button">
                        <Button
                            key="biomeButton"
                            image={Assets.UI.BIOME}
                            onClick={(): void => { this.setState({activeButton: "biome"}); }}
                        />
                        <FloatingPanel
                            key="panel"
                            hidden={this.state?.activeButton !== "biome"}
                            showTriangle={true}
                        >
                            <Button
                                key="grassButton"
                                image={Assets.UI.GRASS}
                                onClick={(): void => { this.setTool(Tool.Biome); this.currentBiome = Biome.Grass; }}
                            />
                            <Button
                                key="snowButton"
                                image={Assets.UI.SNOW}
                                onClick={(): void => { this.setTool(Tool.Biome); this.currentBiome = Biome.Snow; }}
                            />
                            <Button
                                key="sandButton"
                                image={Assets.UI.SAND}
                                onClick={(): void => { this.setTool(Tool.Biome); this.currentBiome = Biome.Sand; }}
                            />
                        </FloatingPanel>
                    </div>
                </div>
                <FloatingPanel
                    key="brushSize"
                    hidden={this.state?.activeTool !== Tool.Biome}
                    showTriangle={false}
                    className="resize-panel"
                >
                    <Button
                        key="decreaseButton"
                        onClick={(): void => { this.setState({radius: Math.max(this.state.radius - 0.25, 0.5)}); }}
                    >-</Button>
                    <span className="radius">{this.state.radius}</span>
                    <Button
                        key="increaseButton"
                        onClick={(): void => { this.setState({radius: Math.min(this.state.radius + 0.25, 5)}); }}
                    >+</Button>
                </FloatingPanel>
            </React.Fragment>
        );
    }

    public start(game: ZooGame): void {
        this.game = game;

        this.ghost = new PlacementGhost(this.game);

        this.setTool(Tool.None);
    }

    public update(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        if(this.game.input.isInputPressed(Inputs.RightMouse)) {
            this.setTool(Tool.None);
        }

        switch(this.state.activeTool) {
            case Tool.Tree:
                if (this.game.input.isInputPressed(Inputs.LeftMouse)) {
                    const placePos: Vector = mouseWorldPos.floor();

                    this.game.placeTileObject(Assets.OBJECTS.TREE, placePos);
                }
                break;
            case Tool.Wall:
                const xDif = mouseWorldPos.floor().x - this.startWallPos?.pos.floor().x;
                const yDif = mouseWorldPos.floor().y - this.startWallPos?.pos.floor().y;
                const horizontal = this.startWallPos?.quadrant === Side.North ||
                                   this.startWallPos?.quadrant === Side.South;
                const length = (horizontal ? Math.abs(xDif) : Math.abs(yDif)) + 1;

                if (this.game.input.isInputPressed(Inputs.LeftMouse)) {
                    const tilePos = mouseWorldPos;
                    const quadrant = this.getQuadrant(mouseWorldPos);

                    this.wallGhosts = [];

                    this.startWallPos = { pos: tilePos, quadrant };
                }
                if (this.game.input.isInputHeld(Inputs.LeftMouse)) {

                    this.ghost.setVisible(false);

                    const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);

                    let i = Math.floor(this.startWallPos?.pos.x);
                    let j = Math.floor(this.startWallPos?.pos.y);
                    for (let w = 0; w < this.wallGhosts.length; w++) {
                        const ghost = this.wallGhosts[w];
                        ghost.setPosition(new Vector(i, j));

                        if (horizontal) {
                            ghost.setSprite(spriteSheet.getTextureById(0));
                            i += Math.sign(mouseWorldPos.floor().x - i);
                            if (this.startWallPos?.quadrant === Side.North) ghost.setOffset(new Vector(0.5, -1));
                            else ghost.setOffset(new Vector(0.5, 0));
                        } else {
                            ghost.setSprite(spriteSheet.getTextureById(1));
                            j += Math.sign(mouseWorldPos.floor().y - j);
                            if (this.startWallPos?.quadrant === Side.West) ghost.setOffset(new Vector(0, 0));
                            else ghost.setOffset(new Vector(1, 0));
                        }
                    };

                    // Generate the ghost entities after so that they have a chance to initialise
                    while (this.wallGhosts.length < length) {
                        const ghost = new PlacementGhost(this.game, false);
                        ghost.canPlaceFunction = (pos: Vector): boolean => this.game.world.wallGrid.isWallInMap(pos, this.startWallPos?.quadrant);
                        this.wallGhosts.push(ghost);
                    }
                    while (this.wallGhosts.length > length) {
                        this.wallGhosts.pop().destroy();
                    }
                }
                if (this.game.input.isInputReleased(Inputs.LeftMouse)) {
                    this.ghost.setVisible(true);

                    if (!this.wallGhosts) return;

                    this.wallGhosts.forEach(ghost => {
                        const tilePos = ghost.getPosition().floor();
                        let quadrant = Side.North;

                        if (horizontal) {
                            if (Math.abs(this.startWallPos?.pos.y % 1) < 0.5) quadrant = Side.North;
                            else quadrant = Side.South;
                        } else {
                            if (Math.abs(this.startWallPos?.pos.x % 1) < 0.5) quadrant = Side.West;
                            else quadrant = Side.East;
                        }

                        this.game.world.wallGrid.placeWallAtTile(this.currentWall, tilePos, quadrant);
                        ghost.destroy();
                    });

                    this.wallGhosts = [];
                }
                break;
            case Tool.Biome:
                if (this.game.input.isInputHeld(Inputs.LeftMouse)) {
                    this.game.world.biomeGrid.setBiome(mouseWorldPos.multiply(2), this.state.radius, this.currentBiome);
                }
                if (this.game.input.isInputPressed(Inputs.IncreaseBrushSize)) {
                    this.setState({radius: Math.min(this.state.radius + 0.25, 5) });
                }
                if (this.game.input.isInputPressed(Inputs.DecreaseBrushSize)) {
                    this.setState({ radius: Math.max(this.state.radius - 0.25, 0.5) });
                }
                break;
            default:
                break;
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        this.wallGhosts?.forEach(ghost => ghost.postUpdate());

        switch(this.state.activeTool) {
            case Tool.Wall:
                const quadrant = this.getQuadrant(mouseWorldPos);
                const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
                switch (quadrant) {
                    case Side.North:
                        this.ghost.setSprite(spriteSheet.getTextureById(0));
                        this.ghost.setOffset(new Vector(0, -0.5));
                        break;
                    case Side.South:
                        this.ghost.setSprite(spriteSheet.getTextureById(0));
                        this.ghost.setOffset(new Vector(0, 0.5));
                        break;
                    case Side.West:
                        this.ghost.setSprite(spriteSheet.getTextureById(1));
                        this.ghost.setOffset(new Vector(-0.5, 0.5));
                        break;
                    case Side.East:
                        this.ghost.setSprite(spriteSheet.getTextureById(1));
                        this.ghost.setOffset(new Vector(0.5, 0.5));
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        this.ghost.postUpdate();
    }

    public setTool(tool: Tool): void {
        this.setState({activeTool: tool});
        this.ghost.setVisible(true);
        this.ghost.setPivot(new Vector(0.5, 0.5));
        this.ghost.setOffset(new Vector(0, 0));

        switch(tool) {
            case Tool.Tree:
                const tree =  AssetManager.getJSON(Assets.OBJECTS.TREE) as TileObjectData;
                this.ghost.setSprite(tree.sprite);
                this.ghost.setPivot(tree.pivot);
                this.ghost.setSnap(true);
                this.setState({activeButton: "tree"});
                break;
            case Tool.Wall:
                this.currentWall =  AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
                const spriteSheet = Wall.wallSprites.get(this.currentWall.spriteSheet);
                this.ghost.setSprite(spriteSheet.getTextureById(0));
                this.ghost.setPivot(new Vector(0.5, 1));
                this.ghost.setSnap(true);
                this.ghost.canPlaceFunction = (pos: Vector): boolean => this.game.world.wallGrid.isWallInMap(pos, this.getQuadrant(this.game.camera.screenToWorldPosition(this.game.input.getMousePos())));
                this.setState({activeButton: "wall"});
                break;
            case Tool.Biome:
                this.ghost.setDrawFunction(pos => {
                    Debug.setLineStyle(1, 0xFFFFFF);
                    Debug.drawCircle(pos.multiply(Config.WORLD_SCALE), this.state.radius * Config.BIOME_SCALE, this.currentBiome, 0.5);
                });
                this.ghost.setSnap(false);
                break;
            case Tool.None:
            default:
                this.ghost.setVisible(false);
                this.setState({activeButton: ""});
                break;
        }
    }

    private getQuadrant(pos: Vector): Side {
        const xrel = ((pos.x + 10000) % 1) - 0.5;
        const yrel = ((pos.y + 10000) % 1) - 0.5;

        if (yrel < 0 && Math.abs(yrel) > Math.abs(xrel)) return Side.North;
        if (xrel > 0 && Math.abs(xrel) > Math.abs(yrel)) return Side.East;
        if (yrel > 0 && Math.abs(yrel) > Math.abs(xrel)) return Side.South;
        if (xrel < 0 && Math.abs(xrel) > Math.abs(yrel)) return Side.West;
    }

    public hasFocus(): boolean {
        return this.state.activeTool !== Tool.None || this.state.activeButton !== "";
    }
}
