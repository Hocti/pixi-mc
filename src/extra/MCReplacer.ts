import {Matrix,Point} from 'pixi.js';
import { Container } from 'pixi.js';
import {EventEmitter} from 'pixi.js';

import {ColorMatrixAction,MCEffect,type EffectGroup,EffectGroupAction,ColorChange} from '../MC/effect';
import {MCModel,MCLibrary,MCSymbolModel} from '../MC/model/';
import {MCDisplayObject} from '../MC/display/';
import {ImultiMC,instanceOfImultiMC} from '../MC/display/ImultiMC';

import MCEX from './MCEX';

export interface Replacer {// extends MCDisplayObject
    addRule(_rule:ReplaceRule):void;
}

export interface IreplacerDisplayObject extends MCDisplayObject{
    replacer:MCReplacer;
    onRenew():void;
}

export type ReplaceRule={
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

export type ReplacerResult={
    symbolModel:MCSymbolModel,
    matrix:Matrix,
    effect?:EffectGroup,
    replaced:boolean
}

export class MCReplacer extends EventEmitter implements Replacer{

    //static===================

    public static instanceOfIreplacerDisplayObject(object: Container): object is IreplacerDisplayObject {
        return 'replacer' in object;
    }

    public static checkMatch(_source:string,rule:ReplaceRule):boolean{
        return rule.matchKey===_source ||
        (rule.matchType==='name' && MCReplacer.starMatch(rule.matchKey,_source)) || 
        (rule.matchType==='regex' && (new RegExp(rule.matchKey, "i")).test(_source));
    }

    public static starMatch(_source:string,_target:string):boolean{
        let arr=_source.split('*');
        if(arr.length===1){
          return _source===_target
        }
        let startKey=-1;
        for(let a of arr){
          if(a==='')continue;
          const ind=_target.indexOf(a);
          if(ind>startKey){
            startKey=ind
          }else{
            return false;
          }
        }
        return true
    }

    public static starReplace(_source:string,matchKey:string,replaceKey:string):string | undefined{
        let fromArr=matchKey.split('*');
        let toArr=replaceKey.split('*');
        if(fromArr.length!==toArr.length)return undefined
        if(!MCReplacer.starMatch(matchKey,_source))return undefined

        let st:int[]=[];
        for(let i=0;i<fromArr.length;i++){
          st[i]=_source.indexOf(fromArr[i]);
        }

        let result:string[]=[];
        for(let i=0;i<fromArr.length;i++){
          result.push(toArr[i]);
            if(i==fromArr.length-1 ){
                if(fromArr[i]==='')break;
                result.push(_source.substring(st[i]+fromArr[i].length));
            }else if(st[i+1]===0){
                result.push(_source.substring(st[i]+fromArr[i].length));
            }else{
                result.push(_source.substring(st[i]+fromArr[i].length,st[i+1]));
            }
        }
        return result.join('');
    }

    static globalRules:ReplaceRule[]=[];

    public static addRule(_rule:ReplaceRule):void{
		this.globalRules.push(_rule);
    }

    public static removeRule(_rule:ReplaceRule):void{
        let index = this.globalRules.indexOf(_rule);
        if (index !== -1) {
            this.globalRules.splice(index, 1);
        }
    }

    //renew all replacer?

    //===================

    private _mc:IreplacerDisplayObject;

	constructor(mc:IreplacerDisplayObject) {
        super();
        this._mc=mc;
		this._mc.on('added',(_parent:Container)=>{
            //console.log('onAdded',_parent,this)
            this.renewRule();
        })
        this.on('renew',()=>{
            this._mc.onRenew();
        });
    }

    //add rules=====================

    private _selfRules:ReplaceRule[]=[];

    public addRule(_rule:ReplaceRule):void{
        if(this._selfRules.indexOf(_rule)!==-1)return
		this._selfRules.push(_rule);
        this.renewRule();
    }

    public addRules(_rules:ReplaceRule[]):void{
        for(const _rule of _rules){
            if(this._selfRules.indexOf(_rule)!==-1)continue
            this._selfRules.push(_rule);
        }
        this.renewRule();
    }

    public removeRule(_rule:ReplaceRule):void{
        let index = this._selfRules.indexOf(_rule);
        if (index !== -1) {
            this._selfRules.splice(index, 1);
            this.renewRule();
        }
    }

    public removeRules(_rules:ReplaceRule[]):void{
        let removed=false;
        for(const _rule of _rules){
            let index = this._selfRules.indexOf(_rule);
            if (index !== -1) {
                this._selfRules.splice(index, 1);
                removed=true;
            }
        }
        if(removed){
            this.renewRule();
        }
    }

    //get Rules=================

    private cacheRules?:ReplaceRule[];

    protected getRule4Children():ReplaceRule[]{
        const rules:ReplaceRule[]=[];
        for(let r of this._selfRules){
            if(r.target==='child' || r.target==='next' || r.target==='both'){
                rules.push(r);
            }else if(r.target==='self' && instanceOfImultiMC(this._mc)){
                rules.push(r);
            }
        }

        if(this._mc.parent && MCReplacer.instanceOfIreplacerDisplayObject(this._mc.parent)){
            rules.push(...(<IreplacerDisplayObject>this._mc.parent).replacer.getRule4Children());
        }
        
        return rules;
    }

    public renewRule():ReplaceRule[]{
        const rules:ReplaceRule[]=[];
        for(let r of this._selfRules){
            if(r.target==='self' || r.target==='both'){
                rules.push(r);
            }
        }

        if(this._mc.parent && MCReplacer.instanceOfIreplacerDisplayObject(this._mc.parent)){
            rules.push(...(<IreplacerDisplayObject>this._mc.parent).replacer.getRule4Children());
        }
        this.cacheRules=rules;
        this.cleanCache();
        this.emit('renew')
        return rules;
    }

    public get rules():ReplaceRule[]{
        if(!this.cacheRules){
            return this.renewRule();
        }
        return this.cacheRules!;
    }

    //use rule=================

    private replaceCache:Record<string,ReplacerResult>={};

    public cleanCache():void{
        this.replaceCache={};
    }

    public getReplace(originalSN:string,layerName:string):ReplacerResult{
        const key:string=`${originalSN}|${layerName}`
        if(this.replaceCache[key]===undefined){
            const rr=this.checkReplace(originalSN,layerName);
            this.replaceCache[key]=rr;
            //console.log('get',key,this.replaceCache[key],rr)
        }
        return this.replaceCache[key];
    }

    public checkReplace(originalSN:string,layerName:string):ReplacerResult{
        const mcModel:MCModel=(<MCEX>this._mc).symbolModel.mcModel;
        let currSymbolModel:MCSymbolModel=mcModel.symbolList[originalSN];
        const effects:EffectGroup[]=[];
        let m:Matrix=currSymbolModel.defaultMatrix?currSymbolModel.defaultMatrix.clone():new Matrix();

        //change slot by rule
        const modelKey:string=MCLibrary.getKeyFromModel(mcModel)!;
        const rules:ReplaceRule[]=this.rules;

        for(const rule of rules){
            if(rule.matchModelKey!==undefined && rule.matchModelKey!==modelKey){
                continue;
            }
            if( rule.type==='symbol' && 
                MCReplacer.checkMatch(originalSN,rule)
            ){
                if(rule.replaceSymbol){
                    currSymbolModel=rule.replaceSymbol;
                }else if(rule.replaceKey){
                    const replacedName:string | undefined=MCReplacer.starReplace(originalSN,rule.matchKey,rule.replaceKey);
                    if(replacedName){
                        if(rule.replaceModel && rule.replaceModel.symbolList[replacedName]){
                            currSymbolModel=rule.replaceModel.symbolList[replacedName];
                        }else if(mcModel.symbolList[replacedName]){
                            currSymbolModel=mcModel.symbolList[replacedName];
                        }
                    }
                }else if(rule.replaceModel && rule.replaceModel.symbolList[rule.matchKey]){
                    currSymbolModel=rule.replaceModel.symbolList[rule.matchKey];
                }

                if(rule.replaceMatrix){
                    m.append(rule.replaceMatrix);
                }
                if(rule.effect){
                    effects.push(rule.effect);
                }

                if(mcModel.symbolList[originalSN]!==currSymbolModel){//after changed
                    if(currSymbolModel.defaultMatrix){
                        m=currSymbolModel.defaultMatrix.clone();
                    }
                    for(const rule of MCReplacer.globalRules){
                        if( //rule.matchModelKey!==undefined && 
                            rule.matchModelKey===MCLibrary.getKeyFromModel(currSymbolModel.mcModel) &&
                            MCReplacer.checkMatch(currSymbolModel.name,rule)
                        ){
                            if(rule.replaceMatrix){
                                m.append(rule.replaceMatrix);
                            }
                            if(rule.effect){
                                effects.push(rule.effect);
                            }
                        }
                    }
                    
                }
            }else if(rule.type==='layer' && MCReplacer.checkMatch(layerName,rule)){
                //console.log('layer')
                if(rule.effect){
                    effects.push(rule.effect);
                }
            }
        }

        let effect:EffectGroup | undefined;
        if(effects.length>1){
            let eg:EffectGroup=EffectGroupAction.create();
            for(const effect of effects){
                eg=EffectGroupAction.merge(eg,effect);
            }
            effect=eg;
        }else if(effects.length===1){
            effect=effects[0];
        }

        return {
            symbolModel:currSymbolModel,
            matrix:m,
            effect,
            replaced:mcModel.symbolList[originalSN]===currSymbolModel
        }
    }
}