const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const prod = process.argv.indexOf('-p') !== -1;

module.exports = {
    mode: "development",
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        hot: true,
        historyApiFallback: true, 
        port: 9000,
        proxy:{
            "/datasnap/rest":"http://localhost:8080"
        }
    },
    devtool:"eval",
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({process: {env: {NODE_ENV: prod ? `"production"`: '"development"'}}}),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "base.html",
            favicon: "./favicon.ico"
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
        }),        
        new CopyPlugin({
            patterns: [
                { from: "./src/dsjs", to: "./dsjs" },
            ],
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
        })
    ],
};