/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

interface ButtonProps {
    image: string;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default class Button extends React.Component<ButtonProps> {

    public render(): JSX.Element {
        return (
            <div css={buttonStyle} onClick={this.props.onClick}>
                <img src={this.props.image} />
            </div>
        );
    }
}

const buttonStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #DDDDDD;
    width: 30px;
    height: 30px;
    cursor: pointer;

    &:hover {
        background-color: #FFFFFF;
    }

    img {
        width: 80%;
        height: 80%;
    }
`;
