module.exports = {
    extends: process.cwd() + '/.eslintrc',
    rules: {
        complexity: [2, 12],
        'underscore/prefer-invoke': 0
    },
    globals: {
        vaui: true,
        geo: true,
        jsonPath: true,
        colorbrewer: true,
        d3: true,
        Papa: true
    }
};
