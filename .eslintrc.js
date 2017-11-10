module.exports = {
    extends: [
        process.cwd() + '/.eslintrc',
        'plugin:react/recommended'
    ],
    'plugins': [
        'react'
    ],
    rules: {
        complexity: [2, 12],
    },
    globals: {
        geo: true,
        jsonPath: true,
        colorbrewer: true,
        d3: true,
        Papa: true
    }
};
