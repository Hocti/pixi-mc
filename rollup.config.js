import typescript from "@rollup/plugin-typescript";
//import ts from "rollup-plugin-ts";
import { terser } from "rollup-plugin-terser";
import sourcemaps from 'rollup-plugin-sourcemaps';
//import minify  from "rollup-plugin-minify-es";
//import resolve from "rollup-plugin-node-resolve";
//import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

const plugins = [
	typescript(),
    sourcemaps(),
	//ts(),
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
            globals: {
                'PIXI': 'pixi.js',

                '@pixi/display': 'PIXI',
                '@pixi/sprite': 'PIXI',

                '@pixi/sound':'@pixi/sound'
            }
        },
        compress: {
            drop_console: true,
        },
    }));
}
/*

                '@pixi/core': 'PIXI',
                '@pixi/math': 'PIXI',
                '@pixi/settings': 'PIXI',
                '@pixi/constants': 'PIXI',
                '@pixi/utils': 'PIXI.utils',
                '@pixi/filter-blur': 'PIXI.filters',
                '@pixi/filter-color-matrix': 'PIXI.filters',
*/

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
    output: 
        {
            banner,
            freeze: false,
            format: "iife",
            name: "PIXIMC",
            sourcemap,
            file: "dist/pixi-mc.js",
            globals: {
                'pixi.js':'PIXI',

                '@pixi/core': 'PIXI',
                '@pixi/constants': 'PIXI',
                '@pixi/settings': 'PIXI',
                '@pixi/math': 'PIXI',
                '@pixi/sprite': 'PIXI',
                '@pixi/ticker': 'PIXI',
                '@pixi/display': 'PIXI',
                '@pixi/utils': 'PIXI',
                '@pixi/loaders': 'PIXI',
                
                '@pixi/filter-blur':'PIXI.filters',
                '@pixi/filter-color-matrix':'PIXI.filters',

                '@pixi/sound':'PIXI.sound',
                'pixi-filters':'PIXI.filters'
            }
		},
    /*[
		{
			file: "dist/pixi-mc.d.ts",
			format: "es"
		}
        {
            banner,
            freeze: false,
            sourcemap,
            format: "cjs",
            file: "dist/pixi-mc.cjs.js",
        },
        {
            banner,
            freeze: false,
            sourcemap,
            format: "esm",
            file: "dist/pixi-mc.esm.js",
        },
    ]*/
    plugins,
};
