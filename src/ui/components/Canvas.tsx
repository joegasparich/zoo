/** @jsx jsx */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { css, jsx } from "@emotion/core";

// import { Config } from "constants";
import { Config } from "consts";

export default class Canvas {
    private baseNode: HTMLElement;
    private children: JSX.Element[];

    private baseStyle = css`
        pointer-events: none;
    `;

    public constructor() {
        this.children = [];
    }

    public load(): void {
        this.baseNode = document.getElementById("uiRoot");
        this.baseNode.style.width = Config.WINDOW_WIDTH + "px";
        this.baseNode.style.height = Config.WINDOW_HEIGHT + "px";

        this.render();
    }

    public render(): void {
        ReactDOM.render(
            <div id="uicanvas" css={this.baseStyle}>
                {this.children}
            </div>,
            this.baseNode,
        );
    }

    public addChild(component: JSX.Element): void {
        this.children.push(component);

        this.render();
    }
}
