module.exports = (config) => {
    config.module.rules.push({
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
            presets: ['es2015', 'react']
        }
    });
    console.log(JSON.stringify(config.module));
    return config;
};
