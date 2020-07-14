//import typescript from "rollup-plugin-typescript";
import ts from "@wessberg/rollup-plugin-ts";
//import { terser } from "rollup-plugin-terser";
//import minify  from "rollup-plugin-minify-es";
//import resolve from "rollup-plugin-node-resolve";
//import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

const plugins = [
	ts(),
	//typescript(),
	//minify({}, minify),
    //resolve(),
    /*commonjs({
        namedExports: {
            "resource-loader": ["Resource"],
		},
    })*/
];

// Disabling minification makes faster
// watch and better coverage debugging
if (process.env.NODE_ENV === "production") {
    plugins.push(terser({
        output: {
            comments(node, comment) {
                return comment.line === 1;
            },
        },
        compress: {
            drop_console: true,
        },
    }));
}

const sourcemap = true;
const compiled = (new Date()).toUTCString().replace(/GMT/g, "UTC");
const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * By Hocti
 * Compiled ${compiled}
 *
 * ${pkg.name} is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */`;

export default {
    input: "src/index.ts",
    external: Object.keys(pkg.peerDependencies),
    output: [
        {
            banner,
            freeze: false,
            format: "iife",
            name: "PIXIMC",
            sourcemap,
            file: "dist/PIXIMC.js"
		}/*,
		{
			file: "dist/PIXIMC.d.ts",
			format: "es"
		}
        {
            banner,
            freeze: false,
            sourcemap,
            format: "cjs",
            file: "dist/PIXIMC.cjs.js",
        },
        {
            banner,
            freeze: false,
            sourcemap,
            format: "esm",
            file: "dist/PIXIMC.esm.js",
        },*/
    ],
    plugins,
};
