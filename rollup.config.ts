import typescript from "rollup-plugin-typescript2";
import sourceMaps from "rollup-plugin-sourcemaps";
import { terser } from "rollup-plugin-terser";

export default {
    input: "./src/LightUp.ts",
    plugins: [
        typescript({
            exclude: "node_modules/**",
            typescript: require("typescript")
        }),
        sourceMaps(),
        terser({
            compress: {
                // drop_console: true,
                pure_funcs: ["console.log", "console.error"],
            },
            format: {
                beautify: true,
            },
            keep_classnames: true,
            keep_fnames: true,
        }),
    ],
    output: [
        {
            format: "commonjs",
            file: "dist/LightUp.js",
            sourcemap: true
        }
    ]
};