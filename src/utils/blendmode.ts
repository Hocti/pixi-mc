import 'pixi.js/advanced-blend-modes';
import {BLEND_MODES} from 'pixi.js';


const advancedBlendModes:BLEND_MODES[] = [
    'color',
    'color-burn',
    'color-dodge',
    'darken',
    'difference',
    'divide',
    'exclusion',
    'hard-light',
    'hard-mix',
    'lighten',
    'linear-burn',
    'linear-dodge',
    'linear-light',
    'luminosity',
    'negation',
    'overlay',
    'pin-light',
    'saturation',
    'soft-light',
    'subtract',
    'vivid-light'
]

const normalBlendModes:BLEND_MODES[] = [
    "normal",
    "add",
    "multiply",
    "screen",
    "overlay",
    "erase",

    //"no-premultiply-alpha"
    "normal-npm",
    "add-npm",
    "screen-npm",

    "min",
    "max",
    
];

export const allBlendModes:BLEND_MODES[] = [...normalBlendModes,...advancedBlendModes];

export const BLEND_MODES_NORMAL:BLEND_MODES = 'normal';