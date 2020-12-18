import typescript from "rollup-plugin-typescript2";
import sourceMaps from "rollup-plugin-sourcemaps";

export default {
    input: "./src/LightUp.ts",
    plugins: [
        typescript({
            exclude: "node_modules/**",
            typescript: require("typescript")
        }),
        sourceMaps(),
    ],
    output: [
        {
            format: "commonjs",
            file: "dist/LightUp.js",
            sourcemap: true
        }
    ]
};