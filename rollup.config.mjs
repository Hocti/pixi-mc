import path from 'path';
import fs from 'fs';

import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import { dts } from "rollup-plugin-dts";

import repo from "./package.json" assert { type: 'json' };

const isProduction = process.env.NODE_ENV === 'production';

const esbuildConfig = {
    target: 'es2020',
    minifySyntax: true,
    define: {
        'process.env.VERSION': `'${repo.version}'`,
        'process.env.DEBUG': isProduction?'false':'true',
    },
    treeShaking: true,
    minify: isProduction,
    tsconfigRaw: '{"compilerOptions":{"useDefineForClassFields":false}}'
}

const plugins = [
    esbuild(esbuildConfig),
    resolve({
        browser: true,
        preferBuiltins: false,
    }),
    json(),
    commonjs(),
];

const sourcemap = true;//!isProduction;
const freeze=false;
const compiled = (new Date()).toUTCString().replace(/GMT/g, "UTC");

const banner = `/*!
 * ${repo.name} - v${repo.version}
 * By Hocti
 * Compiled ${compiled}
 *
 * ${repo.name} is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */`;

 function prodName(name)
 {
     return name.replace(/\.(m)?js$/, '.min.$1js');
 }

const globals={
    /*
    'pixi.js':'PIXI',
    '@pixi/core': 'PIXI',
    '@pixi/constants': 'PIXI',
    '@pixi/settings': 'PIXI',
    '@pixi/math': 'PIXI',
    '@pixi/sprite': 'PIXI',
    '@pixi/ticker': 'PIXI',
    '@pixi/display': 'PIXI',
    '@pixi/loaders': 'PIXI',
    '@pixi/assets': 'PIXI',
    
    '@pixi/utils': 'PIXI.utils',
    
    '@pixi/filter-blur':'PIXI',
    '@pixi/filter-color-matrix':'PIXI',

    
    'eventemitter3':'eventemitter3',
    */
    'pixi.js':'PIXI',

    '@pixi/sound':'PIXI.sound',
    'pixi-filters':'PIXI.filters'
}


async function main() {
    const results=[];
    
    results.push(
    {
        input: "src/index.ts",
        external: Object.keys(repo.peerDependencies),
        output: [
            {
                name: repo.namespace,
                banner,
                freeze,
                sourcemap,
                format: "iife",
                file: repo.bundle,
                globals
            },
            {
                banner,
                freeze,
                sourcemap,
                format: "esm",
                file: repo.module,
                globals
            },
            {
                banner,
                freeze,
                sourcemap,
                format: "cjs",
                file: repo.main,
                globals
            }
        ],
        plugins
    });

    if(isProduction){
        
        results.push(
            {
                input: "src/index.ts",
                external: Object.keys(repo.peerDependencies),
                output: [
                    {
                        banner:banner,
                        file: repo.types,
                        format: "es",
                        globals
                    }
                ],
                plugins:[dts()],
        });
    }        
    return results;
}


export default main();