module.exports = (config) => {
    config.module.rules.push({
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
            presets: ['es2015', 'react'],
            plugins: ['transform-object-rest-spread']
        }
    });
    return config;
};
