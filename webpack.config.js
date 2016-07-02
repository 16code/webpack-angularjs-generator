const path = require('path'),
    args = require('yargs').argv,
    autoprefixer = require('autoprefixer'),
    // webpack
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

// get shell parameters
const isProduct = args.prod,
    isMock = args.mock,
    APP_NAME = JSON.stringify('App');

// webpack plugin config
const webpackPluginCommonConfig = [
    // 声明一些全局的变量 可以在任何js以及模板引擎文件中判断当前环境 example: if(__PROD__);
    new webpack.DefinePlugin({
        __PROD__: isProduct,
        __MOCK__: isMock,
        __APP_NAME__: APP_NAME
    }),
    // 抽离公共依赖打包进 vendor.js
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: isProduct ? 'assets/vendor/vendor.[hash].js' : 'vendor.js',
        minChunks: Infinity
    }),
    new ExtractTextPlugin(isProduct ? 'assets/vendor/[name].[hash].css' : '[name].css'),
    // 定义入口HTML文件
    new HtmlWebpackPlugin({
        template: './src/index.ejs',
        chunks: ['app', 'vendor'],
        appName: APP_NAME,
        title: 'Webpack Angularjs Generator',
        devServer: isMock
    }),
    new webpack.ResolverPlugin([
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('package.json', ['main'])
    ])
];
// 用户生产环境
if (isProduct) {
    webpackPluginCommonConfig.push(
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            comments: false,
            compress: {
                warnings: false,
                keep_fnames: true
            },
            mangle: {
                keep_fnames: true
            }
        }),
        new webpack.optimize.OccurenceOrderPlugin()
    );
}
const webpackConfig = {
    entry: {
        app: ['./src/index'],
        // 将第三方库打包进 vendor
        vendor: [
            // angular
            'angular',
            'angular-ui-router',
            'oclazyload'
        ]
    },
    output: {
        path: './dist/',
        filename: isProduct ? 'assets/vendor/[name].[hash].js' : '[name].js',
        chunkFilename: isProduct ? 'assets/js/[name].[hash].chunk.js' : '[name].chunk.js'
    },
    resolve: {
        root: path.resolve('src'),
        alias: {
            angular: nodeModulesPath('/angular/index'),
            'angular-ui-router': nodeModulesPath('/angular-ui-router/release/angular-ui-router.min'),
            oclazyload: nodeModulesPath('/oclazyload/dist/ocLazyLoad.min')
        },
        modulesDirectories: ['bower_components', 'node_modules'],
        extensions: ['', '.webpack.js', '.web.js', '.js', '.ejs', '.css', '.less', '.png', '.jpg', '.gif', '.svg']
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint',
                exclude: /node_modules/
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                loader: 'ng-annotate?add=true!babel',
                exclude: /(node_modules|src\/libs)/
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: /\.html$/,
                loader: 'html-loader?attrs=img:src img:data-src'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            }, {
                test: /\.(woff|woff2|ttf|eot|svg)(\?]?.*)?$/,
                loader: 'url-loader?limit=1&name=/assets/fonts/[name].[ext]?[hash]'
            }, {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader?limit=8192&name=/assets/images/[name].[hash].[ext]'
            }
        ],
        htmlLoader: {
            ignoreCustomFragments: [/\{\{.*?}}/]
        }
    },
    plugins: webpackPluginCommonConfig,
    debug: isMock,
    devtool: isProduct ? 'source-map' : 'eval',
    devServer: {
        contentBase: './dist',
        historyApiFallback: true,
        stats: {
            modules: false,
            cached: false,
            colors: true,
            chunk: false
        },
        host: '127.0.0.1',
        port: 8080
    },
    postcss: function() {
        return [autoprefixer];
    }
};
function nodeModulesPath(filePath) {
    return path.join(__dirname, 'node_modules', filePath);
}
module.exports = webpackConfig;
