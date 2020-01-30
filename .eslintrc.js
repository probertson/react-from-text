module.exports = {
    env: {
        es6: true,
        node: true,
    },
    overrides: [
        {
            files: ['testSetup.js', '**/__tests__/*.js'],
            env: { jest: true },
        },
    ],
    parser: 'babel-eslint',
    extends: [
        'eslint:recommended',
        'prettier',
        'prettier/react',
    ],
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            jsx: true,
        },
        sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
        'prettier/prettier': 'error',
    },
    globals: {
    },
};
