/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    mode: "development",
    devServer: {
        contentBase: "./dist",
        hot: true,
        port: 4200,
    },
    plugins: [
        new webpack.ProvidePlugin({
            PIXI: "pixi.js",
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Development",
            template: "src/index.html",
        }),
        new CopyWebpackPlugin([{ from: "./src/assets", to: "assets" }]),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "awesome-typescript-loader",
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: "file-loader",
            },
        ],
    },
    resolve: {
        plugins: [
            new TsconfigPathsPlugin({
                configFile: "./tsconfig.json",
            }),
        ],
        extensions: [".tsx", ".ts", ".js", "*"],
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
};
