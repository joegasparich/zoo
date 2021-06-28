/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
    target: "electron-main",
    mode: "development",
    entry: "./src/electron/electron.ts",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist/electron"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    node: {
    // tell webpack that we actually want a working __dirname value
    // (ref: https://webpack.js.org/configuration/node/#node-__dirname)
        __dirname: false,
    },
};
