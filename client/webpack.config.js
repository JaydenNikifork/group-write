const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    entry: {
        index: './src/scripts/index.js',
        story: './src/scripts/story.js',
        storiesHistory: './src/scripts/stories-history.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js', // Separate JS for each entry point
        clean: true, // Clean the dist folder before each build
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'], // Handle CSS
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        hot: true, // Enable HMR
        open: true, // Automatically open the browser
    },
    plugins: [
        // Generate index.html
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html', // Output to dist/index.html
            chunks: ['index'], // Include only index.js
        }),
        new HtmlWebpackPlugin({
            template: './src/story.html',
            filename: 'story.html',
            chunks: ['story'],
        }),
        new HtmlWebpackPlugin({
            template: './src/stories-history.html',
            filename: 'stories-history.html',
            chunks: ['storiesHistory'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css', // Separate CSS for each entry point
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env), // Pass environment variables
        }),
    ],
    mode: 'production',
};
