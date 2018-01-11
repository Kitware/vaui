module.exports = (config) => {
    config.module.rules.push({
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
            presets: ['env', 'react'],
            plugins: ['transform-object-rest-spread', 'transform-class-properties']
        }
    });
    return config;
};
