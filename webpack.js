var _ = require('lodash'),
    webpack = require('webpack');

// Extract packages into `vendor` bundle
var bower = [],
    // Node module packages
    node = ['mithril', 'lodash', 'numeral', 'store', 'jquery', 'bluebird'],
    // Other packages
    other = [],
    vendors = _.union(node, bower, other);

// Configuration
module.exports = {
    entry: {
        app: './app/index.js',
        vendor: vendors,
    },
    output: {
        filename: 'index.bundle.js',
        pathinfo: true
    },
    resolve: {
        modules: ['web_modules', 'node_modules', 'bower_components', 'app'],
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'index.vendor.js'
        })
    ]
};
