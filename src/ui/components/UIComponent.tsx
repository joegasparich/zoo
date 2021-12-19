/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

export interface UIComponentProps {
    id?: string;
    className?: string;
    hidden?: boolean;
}

export default abstract class UIComponent<P extends UIComponentProps, S> extends React.Component<P, S> {
    private baseStyles = css`
        pointer-events: all;

        .hidden {
            display: none;
        }
    `;
    private componentRef = React.createRef<HTMLDivElement>();

    protected getStyles(): SerializedStyles | void {}
    protected abstract getContent(): JSX.Element;

    protected getRootElement(): HTMLDivElement {
        return this.componentRef.current;
    }

    public render(): JSX.Element {
        const style = css`
            ${this.baseStyles};
            ${this.getStyles() || ""}
        `;

        return (
            <div
                id={this.props.id}
                css={style}
                className={(this.props.className ?? "") + (this.props.hidden ? " hidden" : "")}
                ref={this.componentRef}
            >
                {this.getContent()}
            </div>
        );
    }
}
