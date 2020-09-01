import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";
import { Vector } from "engine";
import uuid = require("uuid");
import Window from "ui/components/Window";

interface WindowsState {
    windows: JSX.Element[];
    windowIds: string[]; 
}
const defaultState: WindowsState = {
    windows: [],
    windowIds: [],
};

export default class Windows extends UIComponent<UIComponentProps, WindowsState> {

    public constructor(props: UIComponentProps) {
        super(props);

        this.state = defaultState;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                {this.state?.windows}
            </React.Fragment>
        );
    }

    public openWindow(id: string, title: string, position: Vector, content: JSX.Element): void {
        if (this.state.windowIds.includes(id)) {
            console.log(`Window with id ${id} is already open`);
            return;
        }

        this.setState({
            windows: this.state.windows.concat(
                React.createElement(Window, {
                    handleClose: this.closeWindow.bind(this),
                    key: id,
                    windowId: id,
                    title,
                    content,
                    position,
                }),
            ),
            windowIds: this.state.windowIds.concat(id),
        });
    }

    public closeWindow(id: string): void {
        this.setState({
            windows: this.state.windows.filter(window => id !== window.key),
            windowIds: this.state.windowIds.filter(windowId => id !== windowId),
        });
    }
}
