/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIEvent } from "consts";
import Mediator from "Mediator";
import { Button, FloatingPanel, UIComponent, UIComponentProps } from ".";

interface PanelItem {
    image: string;
    onClick: () => void;
}

interface ExpandingPanelProps extends UIComponentProps {
    focusId: string;
    buttonIcon: string;
    items: PanelItem[];
}
interface ExpandingPanelState {
    panelOpen: boolean;
}
const defaultState: ExpandingPanelState = {
    panelOpen: false,
};

export default class ExpandingPanel extends UIComponent<ExpandingPanelProps, ExpandingPanelState> {
    private focusListener: string;
    private unfocusListener: string;

    public constructor(props: ExpandingPanelProps) {
        super(props);

        this.state = defaultState;

        this.focusListener = Mediator.on(UIEvent.FOCUS, ({ id }: { id: string }) => {
            if (id !== this.props.focusId) {
                this.setState({ panelOpen: false });
            }
        });
        this.unfocusListener = Mediator.on(UIEvent.UNFOCUS, () => this.setState({ panelOpen: false }));
    }

    public componentWillUnmount(): void {
        Mediator.unsubscribe(UIEvent.FOCUS, this.focusListener);
        Mediator.unsubscribe(UIEvent.UNFOCUS, this.unfocusListener);
    }

    protected getStyles(): SerializedStyles {
        return css``;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <div className="panel-button">
                    <Button
                        key={this.props.focusId}
                        image={this.props.buttonIcon}
                        onClick={this.handlePanelButtonClick.bind(this)}
                    />
                    <FloatingPanel key="panel" hidden={!this.state.panelOpen} layout="horizontal" showTriangle={true}>
                        {this.props.items.map((item, index) => (
                            <Button key={index} image={item.image} onClick={item.onClick} />
                        ))}
                    </FloatingPanel>
                </div>
            </React.Fragment>
        );
    }

    private handlePanelButtonClick(): void {
        if (this.state.panelOpen) {
            Mediator.fire(UIEvent.UNFOCUS);
        } else {
            Mediator.fire(UIEvent.FOCUS, { id: this.props.focusId });
        }

        this.setState({ panelOpen: !this.state.panelOpen });
    }
}
