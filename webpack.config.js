const path = require('path'),
{ CleanWebpackPlugin } = require("clean-webpack-plugin"),
CopyWebpackPlugin = require("copy-webpack-plugin"),
{ WebpackManifestPlugin } = require("webpack-manifest-plugin"),
TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        "main.min": './public/widget/plugin/main',
        "widget.min": './public/widget/plugin/widget',
        "widget-css.min": './public/widget/plugin/widget-css'
    },
    output: {
        filename: 'chatbot-plugin.js',
        path: path.resolve(__dirname, 'public/dist'),
        publicPath: "/dist/",
        filename: (pathData) => {
            return `plugin/[name].js`; 
        },
    },
    module: {
        rules: [
            {
                test: '/\.js$|jsx/',
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            {
                test: /\.(css|sass|scss)$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "public/widget/assets/images",
              to: "assets/images",
            },
            {
              from: "public/widget/assets/fonts",
              to: "assets/fonts",
            }
          ],
        }),
        new WebpackManifestPlugin({
            basePath: "/dist/",
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    }
};