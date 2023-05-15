module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:css-modules/recommended"
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: ["react",'css-modules'],
    rules: {
        "react/prop-types": 'off',
        "react/display-name": 'off',
        "react/no-unescaped-entities": 'warn',
        "css-modules/no-unused-class": 'off'

    },
    settings: {
        react: { 
            version: "detect",
            //"pragma": "React",
        }
    }
}
