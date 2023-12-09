# MCEX 
## properties
    replacer:MCReplacer
# method
    setLayerEffect(layerName:string,eg:EffectGroup)
    hasLayerEffect(layerName:string):boolean
    removeLayerEffect(layerName:string)

```ts
type EffectGroup = {
	visible:boolean,
	filters:Filter[],
	alpha:number,
	colorMatrix?:ColorMatrix,
	blendMode:BLEND_MODES
}
```



# LabelMC
    constructor(model:MCSymbolModel, _startLabel:string = "")
## properties
    timeline:LabelTimeline

# LabelTimeline 
# method
    playTo(_target:string | number,_doneCall?:Function)
    fromTo(_from:string | number,_target:string | number,_doneCall?:Function)
    cancel()
    pause()
    resume()



# MCActor
## properties
    get currentMC():MCEX | undefined
    replacer:MCReplacer
# method
    addModel(symbolModel:MCSymbolModel,option?:{
                replaceSame?:boolean,
                matrix?:Matrix,
                includeActions?:string[],
                excludeActions?:string[],
                prefix?:string
            }):MCEX//so hard to explain
    showAction(actionName:string,phaseName?:string,progress:number=0)
    getActions():Record<string,string[]>
    getActionList():string[]
    getActionPhase(actionName:string):string[]



# MCActorPlayer
    constructor(actor:MCActor)
# method
    play(playSteps:ActorStep[],loop:boolean=false)
    stop()
    pause()
    continue()

```ts
type ActorStep
{
    action:string,
    phase?:string,
    from?:number,
    to?:number,
    time:number,
}
```









# MCReplacer
    constructor(mc: IreplacerDisplayObject);
## static properties
    static globalRules: ReplaceRule[];
## static  method
    static instanceOfIreplacerDisplayObject(object: Container): object is IreplacerDisplayObject;
    static checkMatch(_source: string, rule: ReplaceRule): boolean;
    static starMatch(_source: string, _target: string): boolean;
    static starReplace(_source: string, matchKey: string, replaceKey: string): string | undefined;
    static addRule(_rule: ReplaceRule): void;
    static removeRule(_rule: ReplaceRule): void;
## properties
    get rules(): ReplaceRule[];
## method
    addRule(_rule: ReplaceRule): void;
    addRules(_rules: ReplaceRule[]): void;
    removeRule(_rule: ReplaceRule): void;
    removeRules(_rules: ReplaceRule[]): void;;
    renewRule(): ReplaceRule[];
    getReplace(originalSN: string, layerName: string): ReplacerResult;
    checkReplace(originalSN: string, layerName: string): ReplacerResult;

```ts
type ReplaceRule={
    type:'layer'| 'symbol' ,//name or regex
    target:'self' | 'child' | 'both' | 'next',

    //match
    matchType:'name' | 'regex' | 'instanceName',
    matchKey:string,//name or regex
    matchModelKey?:string,

    //replace
    replaceSymbol?:MCSymbolModel
    replaceMatrix?:Matrix,
    replaceModel?:MCModel,
    replaceKey?:string,

    //effect
    effect?:EffectGroup
}
```
```ts
type ReplacerResult={
    symbolModel:MCSymbolModel,
    matrix:Matrix,
    effect?:EffectGroup,
    replaced:boolean
}
```