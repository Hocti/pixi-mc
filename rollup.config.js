//import typescript from 'rollup-plugin-typescript2';
import typescript from 'rollup-plugin-typescript';
//import dtsBundle from 'rollup-plugin-dts-bundle';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
//import ts from "rollup-plugin-ts";
import dts from "rollup-plugin-dts";
//import minify  from "rollup-plugin-minify-es";

import pkg from "./package.json";
//import path from 'path';
//import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
    typescript({ 
        downlevelIteration: false
    }),
    /*
    dtsBundle({
        bundle: {
            name: 'PIXIMC',
            main: 'dist/index.d.ts',
            out: 'pixi-mc.d.ts',
            removeSource: true,
        }
    }),
    */
    sourcemaps(),
    resolve({
        browser: true,
        preferBuiltins: false,
    }),
    commonjs({
        namedExports: {
            'resource-loader': ['Resource'],
        },
    }),
    //dts(),
	//ts(),
	//minify({iife: 'iife.min.js', cjs: 'cjs.min.js'},minify())
];

// Disabling minification makes faster
// watch and better coverage debugging
if (isProduction) {
    plugins.push(terser({
        output: {
            comments(node, comment) {
                return comment.line === 1;
            },
            globals: {
            }
        },
        compress: {
            drop_console: true,
        },
    }));
}

const sourcemap = true;
const freeze=false;
const compiled = (new Date()).toUTCString().replace(/GMT/g, "UTC");

const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * By Hocti
 * Compiled ${compiled}
 *
 * ${pkg.name} is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */`;

const globalD = require("fs").readFileSync("./types/global.d.ts", 'utf8')

const globals={
    'pixi.js':'PIXI',

    '@pixi/core': 'PIXI',
    '@pixi/constants': 'PIXI',
    '@pixi/settings': 'PIXI',
    '@pixi/math': 'PIXI',
    '@pixi/sprite': 'PIXI',
    '@pixi/ticker': 'PIXI',
    '@pixi/display': 'PIXI',
    '@pixi/loaders': 'PIXI',
    
    '@pixi/utils': 'PIXI.utils',
    
    '@pixi/filter-blur':'PIXI.filters',
    '@pixi/filter-color-matrix':'PIXI.filters',

    '@pixi/sound':'PIXI.sound',
    'pixi-filters':'PIXI.filters'
}


async function main() {
    const results=[];
    results.push(
    {
        input: "src/index.ts",
        external: Object.keys(pkg.peerDependencies),
        output: [
            {
                banner,
                freeze,
                sourcemap,
                format: "iife",
                name: pkg.namespace,
                file: pkg.bundle,
                globals
            },
            {
                banner,
                freeze,
                sourcemap,
                format: "esm",
                file: pkg.module,
                globals
            },
            {
                banner,
                freeze,
                sourcemap,
                format: "cjs",
                file: pkg.main,
                globals
            }
        ],
        plugins
    });
    
    results.push(
    {
        input: "src/index.ts",
        external: Object.keys(pkg.peerDependencies),
        output: [
            {
                banner:banner+globalD,
                file: pkg.types,
                format: "es",
                globals
            }
        ],
        plugins:[...plugins,dts()]
    });
    
    return results;
}


export default main();