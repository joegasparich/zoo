/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

export interface UIComponentProps {
    key: string;
    className?: string;
    hidden?: boolean;
}

export default abstract class UIComponent<P extends UIComponentProps, S> extends React.Component<P, S> {
    private baseStyles = css`
        pointer-events: all;
        background: #AAAAAA;

        .hidden {
            display: none;
        }
    `;

    protected getStyles(): SerializedStyles | void {};
    protected abstract getContent(): JSX.Element;

    public render(): JSX.Element {
        const style = css`
            ${this.baseStyles};
            ${this.getStyles() || ""}
        `;

        return (
            <div css={style} className={(this.props.className ?? "") + (this.props.hidden ? " hidden" : "")}>
                {this.getContent()}
            </div>
        );
    }
}
