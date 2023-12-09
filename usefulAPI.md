# MCPlayer
## properties
    fps:number
## static method
    getInstance()
    initTicker(_ticker:Ticker)



# MCLoader
## static method
    loadModelFolder(_folder:string,_maxSpritemap:number=0,otherFiles:string[]=[],extenalFiles:string[]=[]):Promise<MCModel>
    loadModel(_folder:string,_files:string[],extenalFiles:string[]=[]):Promise<MCModel>
    loadModelFiles(_folder:string,filesRecord:Record<string,string>):Promise<MCModel>
    loadModels(_folderPaths:string[]):Promise<MCModel[]>
    createLoaderContainer(_folder:string,_loadcall?:(loader:Container,content:MC)=>void):Container


# MCLibrary
## static method
    get(key:string):MCModel|undefined
    getSymbol(key:string,symbolName?:string):MCSymbolModel


# MCModel
## properties
    mainSymbolModel:MCSymbolModel;
    symbolList:Record<string,MCSymbolModel>
    basepath:string;
    name:string;
    fps:number;
    withScene:boolean
    sceneList:string[]
## method
    makeInstance(_symbolname?:string):MCDisplayObject


# MCSymbolModel
## properties
    name:string
    mcModel:MCModel;
    LabelList:FrameLabels
    totalFrames:uint
    isMaster:boolean
    layerNameList:string[]
    defaultBlendMode:BLEND_MODES
    defaultStopAtEnd:boolean
    defaultVisible:boolean
    isMCSprite:boolean
## method
    makeInstance():IMCSprite
    containFrameLabel(_label:string):boolean




# MC
## properties
    symbolModel:MCSymbolModel
    timeline:MCTimeline
    player:MCPlayer
    stopAtEnd:boolean;
## method
    stopAll():void
        showFrame(frame:number):void
        path():string



# MCTimeline
## properties
    get currentFrame():number
    get totalFrames():number
    get currentLabel():string | undefined
    get labels():FrameLabels
    get isPlaying():boolean
    get labels():FrameLabels
    get totalFrames():number
## method
    gotoAndPlay(target:playTarget)
    gotoAndStop(target:playTarget)
    play()
    stop()
    nextFrame()
    prevFrame()
    goto(target:playTarget)
    getLabelFromFrame(frameNumber:number):string | undefined
    addScript(_target:number|string,_fn:Function):void
    clearScript(_target:number):void



# MCScene
## properties
    get sceneTimeline():MCTimeline
    get currentMC():MC
## method
    nextScene()
    prevScene()
    gotoSceneAndPlay(_scene:string|number,_target:string|number):void
    gotoSceneAndStop(_scene:string|number,_target:string|number):void
    changeScene(_scene:number|string)
    getScene(_scene:string|number):MC