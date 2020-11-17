const { defaults } = require('jest-config');

module.exports = {
    ...defaults,
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testPathIgnorePatterns: ["/dist"],
    globals: {
        // "ts-jest": {
        //     babelConfig:{}
        // }
    },
}