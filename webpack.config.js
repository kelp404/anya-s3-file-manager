const path = require('path');
const config = require('config');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = () => {
	const IS_DEVELOPMENT = (process.env.NODE_ENV || 'development') === 'development';

	return {
		target: 'web',
		mode: IS_DEVELOPMENT ? 'development' : 'production',
		entry: {
			web: path.join(__dirname, 'src', 'frontend', 'web', 'index.js'),
		},
		devServer: {
			host: config.WEBPACK_DEV_SERVER.HOST,
			port: config.WEBPACK_DEV_SERVER.PORT,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Max-Age': '3000',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Allow-Methods': 'GET',
			},
		},
		output: {
			path: path.join(__dirname, 'dist', 'frontend'),
			publicPath: IS_DEVELOPMENT
				? `//${config.WEBPACK_DEV_SERVER.HOST}:${config.WEBPACK_DEV_SERVER.PORT}/`
				: `${config.ASSETS_PATH}/`,
			filename: IS_DEVELOPMENT ? '[name].js' : '[name].[hash:8].js',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									'@babel/preset-env',
								],
							},
						},
					],
				},
				{
					test: /\.css$/,
					use: [
						{loader: MiniCssExtractPlugin.loader},
						{loader: 'css-loader'},
					],
				},
				{
					test: /\.scss$/,
					use: [
						{loader: MiniCssExtractPlugin.loader},
						{loader: 'css-loader'},
						{loader: 'sass-loader'},
					],
				},
				{
					test: /\.(jpg|png|gif|eot|svg|woff|woff2|ttf)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								esModule: false,
								name: 'resources/[name].[hash:8].[ext]',
								publicPath: `//${config.WEBPACK_DEV_SERVER.HOST}:${config.WEBPACK_DEV_SERVER.PORT}/`,
							},
						},
					],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: IS_DEVELOPMENT ? '[name].css' : '[name].[hash:8].css',
				chunkFilename: IS_DEVELOPMENT ? '[name]-[id].css' : '[name]-[id].[hash:8].css',
			}),
			new HtmlWebpackPlugin({
				chunks: ['web'],
				filename: path.join('express', 'web.html'),
				template: path.join('src', 'frontend', 'express', 'web.html'),
				inject: false,
				templateParameters: (compilation, assets, options) => ({
					webpack: compilation.getStats().toJson(),
					htmlWebpackPlugin: {
						files: assets,
						options,
					},
				}),
			}),
			...IS_DEVELOPMENT ? [] : [
				new CompressionWebpackPlugin({
					deleteOriginalAssets: true,
					filename: '[file]',
					algorithm: 'gzip',
					test: /\.(js|css|svg)$/,
					threshold: 0,
				}),
			],
		],
	};
};
