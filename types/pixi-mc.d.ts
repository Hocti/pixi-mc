/*!
 * pixi-mc - v2.0.1
 * By Hocti
 * Compiled Sun, 31 Jul 2022 09:24:54 UTC
 *
 * pixi-mc is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */
import { BLEND_MODES } from '@pixi/constants';
import { Filter, Texture } from '@pixi/core';
import { ColorMatrix } from '@pixi/filter-color-matrix';
import { Sprite } from '@pixi/sprite';
import { Matrix, Rectangle } from '@pixi/math';
import { Container, IDestroyOptions } from '@pixi/display';
import { EventEmitter } from '@pixi/utils';
import { Ticker } from '@pixi/ticker';
import { Sound } from '@pixi/sound';

type uint=number;

declare abstract class MCDisplayObject extends Sprite {
    filtercache: Record<string, Filter>;
    baseEffect: EffectGroup;
    extraEffects: Record<string, EffectGroup>;
    effectChanged: boolean;
    temp_matrix: {
        m2d?: Matrix;
        m2d2?: Matrix;
        TRP?: {
            x: number;
            y: number;
        };
    };
    constructor();
    showEffect(): void;
    addEffect(effect: EffectGroup, name: string): void;
    containEffect(name: string): boolean;
    removeEffect(name: string): void;
}

declare type EffectGroup = {
    visible: boolean;
    filters: Filter[];
    alpha: number;
    colorMatrix?: ColorMatrix;
    blendMode: BLEND_MODES;
};
declare class EffectGroupAction {
    static create(): EffectGroup;
    static clone(_effect: EffectGroup): EffectGroup;
    static equalSimple(_effect1: EffectGroup, _effect2: EffectGroup): boolean;
    static merge(_effect1: EffectGroup, _effect2: EffectGroup): EffectGroup;
    static append(_obj: MCDisplayObject, _effect: EffectGroup): void;
}

declare enum TintType {
    none = 0,
    flash = 1,
    over = 2
}
declare class ColorChange {
    _colorMatrix: ColorMatrix;
    constructor(brightness?: number, hue?: number, saturation?: number, contrast?: number, tintColor?: uint, tintRate?: number, tintType?: TintType);
    get brightness(): number;
    get hue(): number;
    get saturation(): number;
    get contrast(): number;
    get tintColor(): uint;
    get tintRate(): number;
    get tintType(): TintType;
    get colorMatrix(): ColorMatrix;
    set brightness(brightness: number);
    set hue(hue: number);
    set saturation(saturation: number);
    set contrast(contrast: number);
    set tintColor(_color: uint | string);
    set tintOver(_rate: number);
    clearTintOver(): void;
}

declare class ColorMatrixAction {
    static create(): ColorMatrix;
    static clone(p1: ColorMatrix): ColorMatrix;
    static multiply(_p1: ColorMatrix, _p2: ColorMatrix): ColorMatrix;
    static tintOver(_color: string | uint): ColorMatrix;
    static tint(_color: string | uint, m?: number): ColorMatrix;
    static flashBrightness(b: number): ColorMatrix;
    static set4(_brightness?: number, _hue?: number, _saturation?: number, _contrast?: number): ColorMatrix;
    static brightness(b: number): ColorMatrix;
    static hue(p_val?: number): ColorMatrix;
    static saturation(p_val?: number): ColorMatrix;
    static contrast(p_val?: number): ColorMatrix;
}

declare type frameData = {
    child: childData[];
    layer: layerData[];
};
declare type childData = {
    data?: rawInstenceData | rawAsiData;
    type: MCType;
    firstframe: uint;
    layer: uint;
    timeslot: uint;
};
declare type layerData = {
    num: uint;
    name: string;
    C?: colorData;
    F?: filterData;
    isMask: boolean;
    maskBy?: string;
};
declare type AsiModel = {
    rect: Rectangle;
    image: string;
    rotated: boolean;
    zoom: number;
    matrix: Matrix;
    texture?: Texture;
};
declare enum SoundType {
    SoundEffect = "se",
    BackgroundMusic = "bgm",
    BackgroundEffect = "bge",
    stopAllSound = "stopAllSound"
}
declare type SoundRemark = {
    type: SoundType;
    soundFile: string;
};
declare type PlayRemark = {
    type: string;
    frame?: playTarget;
    frameLabel?: string;
    frameNumber?: number;
};
declare type playTarget = string | number;
declare type ScriptRemark = {
    frame: uint;
    args: string[];
};
declare type ExtraRemark = {
    type: string;
    frame_begin: uint;
    frame_end: uint;
    frame_label?: string;
    args: string[];
};
declare type GeomRemark = {
    type: string;
    frame_begin: uint;
    frame_end: uint;
    args: string[];
    x: number;
    y: number;
    w?: number;
    h?: number;
    r?: number;
    rotate?: number;
};
declare type spriteData = {
    ATLAS: {
        SPRITES: rawSprite[];
    };
    meta: {
        app: string;
        version: string;
        image: string;
        format: string;
        size: {
            w: uint;
            h: uint;
        };
        resolution: string;
    };
};
declare type rawSprite = {
    SPRITE: {
        name: string;
        x: uint;
        y: uint;
        w: uint;
        h: uint;
        rotated: boolean;
    };
};
declare type fullmodelData = {
    AN: symbolModelData;
    SD?: {
        S: symbolModelData[];
    };
    MD: {
        FRT: number;
    };
};
declare type symbolModelData = {
    N?: string;
    SN: string;
    TL: {
        L: rawlayerData[];
    };
};
declare type rawlayerData = {
    LN: string;
    FR: rawframeData[];
    LT?: "Clp";
    Clpb?: string;
};
declare type rawframeData = {
    I: uint;
    DU: uint;
    E: rawframeElementData[];
    N?: string;
    C?: colorData;
    F?: filterData;
};
declare type rawframeElementData = {
    ASI?: rawAsiData;
    SI?: rawInstenceData;
};
declare type rawAsiData = {
    N: string;
    M3D: m3d;
};
declare type rawInstenceData = {
    SN: string;
    IN: string;
    ST: MCType;
    TRP: {
        x: number;
        y: number;
    };
    FF?: uint;
    LP?: LoopState;
    M3D: m3d;
    C?: colorData;
    F?: filterData;
};
declare enum MCType {
    MovieClip = "MC",
    Button = "B",
    Graphic = "G",
    ASI = "asi",
    Sprite = "Sprite"
}
declare type m3d = [number, ...Array<number>] & {
    length: 16;
};
declare enum LoopState {
    Loop = "LP",
    Once = "PO",
    Stop = "SF"
}
declare type colorData = {
    M: 'CA' | 'AD' | 'T' | 'CBRT';
    BRT?: number;
    TC?: string;
    TM?: number;
    RM: number;
    GM: number;
    BM: number;
    AM: number;
    RO: number;
    GO: number;
    BO: number;
    AO: number;
};
declare type filterData = {
    BLF?: {
        BLX: number;
        BLY: number;
        Q: uint;
    };
    GF?: {
        BLX: number;
        BLY: number;
        Q: uint;
        C: string;
        STR: number;
        KK: boolean;
        IN: boolean;
    };
    DSF?: {
        AL: number;
        BLX: number;
        BLY: number;
        C: string;
        A: number;
        DST: number;
        HO: boolean;
        IN: boolean;
        KK: boolean;
        Q: uint;
        STR: number;
    };
    BF?: {
        BLX: number;
        BLY: number;
        SC: string;
        SA: number;
        HC: string;
        HA: number;
        Q: uint;
        STR: number;
        KK: boolean;
        AL: number;
        DST: number;
    };
    ACF?: {
        BRT: number;
        CT: number;
        SAT: number;
        H: number;
    };
};

type MCStructure_frameData = frameData;
type MCStructure_childData = childData;
type MCStructure_layerData = layerData;
type MCStructure_AsiModel = AsiModel;
type MCStructure_SoundType = SoundType;
declare const MCStructure_SoundType: typeof SoundType;
type MCStructure_SoundRemark = SoundRemark;
type MCStructure_PlayRemark = PlayRemark;
type MCStructure_playTarget = playTarget;
type MCStructure_ScriptRemark = ScriptRemark;
type MCStructure_ExtraRemark = ExtraRemark;
type MCStructure_GeomRemark = GeomRemark;
type MCStructure_spriteData = spriteData;
type MCStructure_fullmodelData = fullmodelData;
type MCStructure_symbolModelData = symbolModelData;
type MCStructure_rawAsiData = rawAsiData;
type MCStructure_rawInstenceData = rawInstenceData;
type MCStructure_MCType = MCType;
declare const MCStructure_MCType: typeof MCType;
type MCStructure_m3d = m3d;
type MCStructure_LoopState = LoopState;
declare const MCStructure_LoopState: typeof LoopState;
type MCStructure_colorData = colorData;
type MCStructure_filterData = filterData;
declare namespace MCStructure {
  export {
    MCStructure_frameData as frameData,
    MCStructure_childData as childData,
    MCStructure_layerData as layerData,
    MCStructure_AsiModel as AsiModel,
    MCStructure_SoundType as SoundType,
    MCStructure_SoundRemark as SoundRemark,
    MCStructure_PlayRemark as PlayRemark,
    MCStructure_playTarget as playTarget,
    MCStructure_ScriptRemark as ScriptRemark,
    MCStructure_ExtraRemark as ExtraRemark,
    MCStructure_GeomRemark as GeomRemark,
    MCStructure_spriteData as spriteData,
    MCStructure_fullmodelData as fullmodelData,
    MCStructure_symbolModelData as symbolModelData,
    MCStructure_rawAsiData as rawAsiData,
    MCStructure_rawInstenceData as rawInstenceData,
    MCStructure_MCType as MCType,
    MCStructure_m3d as m3d,
    MCStructure_LoopState as LoopState,
    MCStructure_colorData as colorData,
    MCStructure_filterData as filterData,
  };
}

declare class MCEffect {
    static setColorMatrix(obj: MCDisplayObject, cmatrix: ColorMatrix, _prefix?: string): void;
    static setRawColorAndFilter(obj: MCDisplayObject, _cData?: colorData, _fData?: filterData, _prefix?: string): void;
    static tint(obj: MCDisplayObject, colors: uint[], bw?: {
        black?: uint;
        white?: uint;
    }, epsilon?: number): void;
    static removeTint(obj: MCDisplayObject): void;
}

declare function getTimer(): uint;

declare type fileInfo = {
    path: string;
    name: string;
    type: string;
    folder: string;
    size: uint;
};
declare type folderInfo = {
    path: string;
    files: fileInfo[];
};
declare class FileList {
    static getInstance(): FileList;
    getFolderInfoFromPath(_path: string, _subfolder?: boolean): folderInfo;
    static getfolderInfoFromText(_listpath: string, _basepath: string | undefined, _call: Function): void;
    static getfolderInfoFromTextAsync(_listpath: string, _basepath?: string): Promise<fileInfo[]>;
    static pathToInfo(_filepath: string, _basepath?: string): fileInfo;
    static getFilesFromFolder(_args: folderInfo | string[]): [string, string[]];
}

declare function m3dto2d(a: number[]): Matrix;
declare function clamp(input: number, min: number, max: number): number;
declare function cleanValue(p_val: number, p_limit: number): number;
declare const degree: number;
declare const radian: number;
declare function makeMatrix(scaleX: number, scaleY?: number, rotate?: number, x?: number, y?: number): Matrix;
declare function m2dDetail(m: Matrix): {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
};

declare const TMath_m3dto2d: typeof m3dto2d;
declare const TMath_clamp: typeof clamp;
declare const TMath_cleanValue: typeof cleanValue;
declare const TMath_degree: typeof degree;
declare const TMath_radian: typeof radian;
declare const TMath_makeMatrix: typeof makeMatrix;
declare const TMath_m2dDetail: typeof m2dDetail;
declare namespace TMath {
  export {
    TMath_m3dto2d as m3dto2d,
    TMath_clamp as clamp,
    TMath_cleanValue as cleanValue,
    TMath_degree as degree,
    TMath_radian as radian,
    TMath_makeMatrix as makeMatrix,
    TMath_m2dDetail as m2dDetail,
  };
}

declare type FrameLabels = Record<string, uint>;
declare enum playStatus {
    playing = 0,
    stop = 1
}
declare enum playDirection {
    obverse = 1,
    reverse = -1
}
declare class Timeline extends EventEmitter {
    constructor(_totalFrames?: uint, _labels?: FrameLabels);
    processFrame(_framepass?: uint): void;
    get active(): boolean;
    set active(_b: boolean);
    getLabelFromFrame(frameNumber: uint): string | undefined;
    get currentLabel(): string | undefined;
    get labels(): FrameLabels;
    get totalFrames(): uint;
    get currentFrame(): uint;
    get isPlaying(): boolean;
    goto(target: playTarget): void;
    gotoAndPlay(target: playTarget): void;
    gotoAndStop(target: playTarget): void;
    play(): void;
    stop(): void;
    nextFrame(): void;
    prevFrame(): void;
}

declare class MCModel {
    mainSymbolModel: MCSymbolModel;
    symbolList: Record<string, MCSymbolModel>;
    partList: Record<string, AsiModel>;
    basepath: string;
    fps: number;
    sceneList: string[];
    withScene: boolean;
    name: string;
    static preloadAllTexture: boolean;
    constructor(animation: fullmodelData, spritemaps: spriteData[], basepath: string);
    preloadTexture(): void;
    makeInstance(_symbolname?: string): MCDisplayObject;
}

interface IMCSprite extends MCDisplayObject {
    type: MCType;
    symbolModel: MCSymbolModel;
}

declare class MCSymbolModel {
    mcModel: MCModel;
    name: string;
    layerNameList: string[];
    LabelList: FrameLabels;
    totalFrames: uint;
    isMaster: boolean;
    soundRemarks: SoundRemark[][];
    playRemarks: PlayRemark[];
    visibleRemarks: boolean[];
    scriptRemarks: Record<string, ScriptRemark>;
    geomRemarks: GeomRemark[];
    extraRemarks: Record<string, ExtraRemark[]>;
    defaultBlendMode: BLEND_MODES;
    defaultStopAtEnd: boolean;
    defaultVisible: boolean;
    defaultMatrix?: Matrix;
    isMCSprite: boolean;
    spriteMatrix?: Matrix;
    spriteModel?: AsiModel;
    constructor(data: symbolModelData, _model: MCModel);
    getFrame(frame: uint): frameData;
    makeInstance(): IMCSprite;
    containFrameLabel(_label: string): boolean;
}

declare class MCTimeline extends Timeline {
    mc: MC;
    halfFrame: boolean;
    direction: playDirection;
    constructor(_mc: MC);
    onMCAdded(): void;
    addScript(_target: uint | string, _fn: Function): void;
    clearScript(_target: uint): void;
    get speed(): number;
    set speed(_n: number);
    get labels(): FrameLabels;
    get totalFrames(): uint;
}

declare class MCPlayer {
    constructor();
    static getInstance(): MCPlayer;
    static ticker: Ticker;
    static initTicker(_ticker: Ticker): void;
    fps: number;
    addMC(mc: MC): void;
}

declare class ASI extends MCDisplayObject {
    static MAX_SIDE: uint;
    static totalASI: uint;
    model: AsiModel;
    constructor(model: AsiModel);
    prepareTexture(): boolean;
    static makeTexture(model: AsiModel): Texture;
}

declare type MCOption = {
    player?: MCPlayer;
};
declare class MC extends MCDisplayObject implements IMCSprite {
    static totalMC: uint;
    static REMOVEMC: uint;
    static countChildren(s: Sprite): uint;
    path(): string;
    static MAX_SAME: uint;
    static defaultRemovePasted: boolean;
    symbolModel: MCSymbolModel;
    timeline: MCTimeline;
    player: MCPlayer;
    removePasted: boolean;
    firstFrame: uint;
    loop: LoopState;
    graphic_start: uint;
    stopAtEnd: boolean;
    isScene: boolean;
    constructor(symbolModel: MCSymbolModel, option?: MCOption);
        children: boolean;
        texture: boolean;
    };
    destroy(options?: IDestroyOptions | boolean): void;
    set type(_type: MCType);
    get type(): MCType;
    stopAll(): void;
    showFrame(frame: uint): void;
}

interface ImultiMC extends MCDisplayObject {
    currentMC?: IMCSprite;
}

declare class MCScene extends MCDisplayObject implements ImultiMC {
    sceneName: string[];
    player: MCPlayer;
    constructor(model?: MCSymbolModel, _player?: MCPlayer);
    get currentMC(): MC;
    addModelToScene(sm: MCSymbolModel, sceneName?: string): void;
    changeScene(_scene: number | string): void;
    nextScene(): void;
    prevScene(): void;
    get sceneTimeline(): MCTimeline;
    gotoSceneAndPlay(_scene: string | number, _target: string | number): void;
    gotoSceneAndStop(_scene: string | number, _target: string | number): void;
    getScene(_scene: string | number): MC;
    static getParentSceneFromMC(_mc: MC): MCScene | undefined;
        children: boolean;
        texture: boolean;
    };
    destroy(): void;
}

declare class MCSprite extends MCDisplayObject implements IMCSprite {
    asi: ASI;
    symbolModel: MCSymbolModel;
    type: MCType;
    constructor(sm: MCSymbolModel);
    showEffect(): void;
}

declare class MCLibrary {
    static push(_obj: MCModel, key?: string): void;
    static get(key: string): MCModel;
    static getSymbol(key: string, symbolName?: string): MCSymbolModel;
    static getKeyFromModel(_obj: MCModel): string | undefined;
}

declare class MCLoader extends EventEmitter {
    static loadModelAsync(_args: folderInfo | string[]): Promise<MCModel>;
    static loadModel(_args: folderInfo | string[], _loadcall?: {
        (args: MCModel): void;
    }): void;
    static loadModelsAsync(_folderPaths: string[], _basePath?: string): Promise<MCModel[]>;
    static loadModels(_folderPaths: string[], _basePath?: string, _loadcall?: {
        (args: MCModel[]): void;
    }): void;
    static unload(modelname: string): void;
    static unloadMulti(modelnames: string[]): void;
    static createLoaderContainer(_args: folderInfo | string[], _loadcall?: EventEmitter.ListenerFn): Container;
}

declare class MCSound {
    static seVolume: number;
    static bgmVolume: number;
    static fileType: string[];
    static SoundType: typeof SoundType;
    static seList: Sound[];
    static currBgm?: Sound;
    static lastBgm?: Sound;
    static bgmFadeAcc: number;
    static bgmFadeTarget: number;
    static play(_soundRemark: SoundRemark, _basepath?: string): void;
    static reuseKey: uint[];
    static clearTimer: number;
    static initTicker(ticker: Ticker): void;
    static playBGM(filepath: string): void;
    static stopBGM(): void;
    static playSE(filepath: string): Sound;
    static destroyEnded(): void;
    static stopAllSE(): void;
    static stopAllSound(): void;
    static pauseAll(): void;
    static resumeAll(): void;
}

interface Replacer {
    addRule(_rule: ReplaceRule): void;
}
interface IreplacerDisplayObject extends MCDisplayObject {
    replacer: MCReplacer;
    onRenew(): void;
}
declare type ReplaceRule = {
    type: 'layer' | 'symbol';
    target: 'self' | 'child' | 'both' | 'next';
    matchType: 'name' | 'regex' | 'instanceName';
    matchKey: string;
    matchModelKey?: string;
    replaceSymbol?: MCSymbolModel;
    replaceMatrix?: Matrix;
    replaceModel?: MCModel;
    replaceKey?: string;
    effect?: EffectGroup;
};
declare type ReplacerResult = {
    symbolModel: MCSymbolModel;
    matrix: Matrix;
    effect?: EffectGroup;
    replaced: boolean;
};
declare class MCReplacer extends EventEmitter implements Replacer {
    static instanceOfIreplacerDisplayObject(object: Container): object is IreplacerDisplayObject;
    static checkMatch(_source: string, rule: ReplaceRule): boolean;
    static starMatch(_source: string, _target: string): boolean;
    static starReplace(_source: string, matchKey: string, replaceKey: string): string | undefined;
    static globalRules: ReplaceRule[];
    static addRule(_rule: ReplaceRule): void;
    static removeRule(_rule: ReplaceRule): void;
    constructor(mc: IreplacerDisplayObject);
    addRule(_rule: ReplaceRule): void;
    addRules(_rules: ReplaceRule[]): void;
    removeRule(_rule: ReplaceRule): void;
    removeRules(_rules: ReplaceRule[]): void;
    renewRule(): ReplaceRule[];
    get rules(): ReplaceRule[];
    cleanCache(): void;
    getReplace(originalSN: string, layerName: string): ReplacerResult;
    checkReplace(originalSN: string, layerName: string): ReplacerResult;
}

declare class MCEX extends MC implements IreplacerDisplayObject {
    showFloatFrame(_frame: number): void;
    replacer: MCReplacer;
    onRenew(): void;
    addLayerEffect(layerName: string, eg: EffectGroup): void;
    removeLayerEffect(layerName: string): void;
}

declare class LabelMC extends MCEX {
    constructor(model: MCSymbolModel, _startLabel?: string, _player?: MCPlayer);
}

declare class MCActor extends MCDisplayObject implements IreplacerDisplayObject, ImultiMC {
    get currentMC(): MCEX | undefined;
    addModel(symbolModel: MCSymbolModel, option?: {
        replaceSame?: boolean;
        matrix?: Matrix;
        includeActions?: string[];
        excludeActions?: string[];
        prefix?: string;
    }): MCEX;
    showAction(actionName: string, phaseName?: string, progress?: number): void;
    checkAction(actionAndPhase: Record<string, string[]>): boolean;
    destroy(): void;
    replacer: MCReplacer;
    onRenew(): void;
}

export { ASI, ColorChange, ColorMatrixAction, EffectGroup, EffectGroupAction, FileList, LabelMC, MC, MCActor, MCDisplayObject, MCEX, MCEffect, MCLibrary, MCLoader, MCModel, MCPlayer, MCReplacer, MCScene, MCSound, MCSprite, MCStructure, MCSymbolModel, MCTimeline, TMath, TintType, fileInfo, folderInfo, getTimer };
