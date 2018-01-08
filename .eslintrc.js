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
        // Many props won't be needed once moved to Redux
        'react/prop-types': 'off',
        'promise/no-nesting': 'off',
        'promise/always-return': 'off'
    },
    globals: {
        geo: true,
        jsonPath: true,
        colorbrewer: true,
        d3: true,
        Papa: true
    }
};
