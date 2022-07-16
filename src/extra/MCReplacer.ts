import {Matrix,Point} from '@pixi/math';
import { Container,IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import {BLEND_MODES} from '@pixi/constants';

import MC from '../MC/MC';
import MCSymbolModel from '../MC/MCSymbolModel';
import MCTimeline from '../MC/MCTimeline';
import MCPlayer from '../MC/MCPlayer';
import {ColorMatrixAction,MCEffect,EffectGroup,EffectGroupAction,ColorChange} from '../MC/MCEffect';
import ASI from '../MC/ASI';
import {MCType,childData, LoopState,layerData,rawInstenceData, rawAsiData} from '../MC/MCStructure';

import * as TMath from '../utils/TMath';
import MCDisplayObject from '../MC/MCDisplayObject';
import MCEX from './MCEX';
import MCModel from '../MC/MCModel';

export interface Replacer {// extends MCDisplayObject
    addRule(_rule:ReplaceRule):void;

}

export interface ReplacerDisplayObject extends MCDisplayObject{
    replacer:MCReplacer;
}

export type ReplaceRule={
    type:'layer'| 'symbol' ,//name or regex
    target:'self' | 'child' | 'both',

    //match
    matchType:'name' | 'regex',
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

export class MCReplacer implements Replacer{

    //static===================

    public static instanceOfReplacerDisplayObject(object: MCDisplayObject): object is MCDisplayObject {
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

    static defaultRules:ReplaceRule[]=[];

    public static addDefaultRule(_rule:ReplaceRule):void{
		this.defaultRules.push(_rule);
    }

    public static removeDefaultRule(_rule:ReplaceRule):void{
        let index = this.defaultRules.indexOf(_rule);
        if (index !== -1) {
            this.defaultRules.splice(index, 1);
        }
    }

    //===================

    private _mc:ReplacerDisplayObject;

	constructor(mc:ReplacerDisplayObject) {
        this._mc=mc;
		this._mc.on('added',(_parent:Container)=>{
            //console.log('onAdded',_parent,this)
            this.renewRule();
        })
    }
    //add rules=====================

    private _selfRules:ReplaceRule[]=[];

    public addRule(_rule:ReplaceRule):void{
		this._selfRules.push(_rule);
        this.renewRule();
    }

    public addRules(_rules:ReplaceRule[]):void{
        for(const _rule of _rules){
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
            if(r.target==='child' || r.target==='both'){
                rules.push(r);
            }
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
        let currMC:MCDisplayObject=this._mc;
        let l:uint=0;

        while(currMC.parent instanceof MCDisplayObject){
            currMC=currMC.parent;
            if(MCReplacer.instanceOfReplacerDisplayObject(currMC)){
                rules.push(...(<ReplacerDisplayObject>currMC).replacer.getRule4Children());
            }
            if(l++>10){
                break;
            }
        }

        this.cacheRules=rules;
        return rules;
    }

    public get rules():ReplaceRule[]{
        if(!this.cacheRules){
            return this.renewRule();
        }
        return this.cacheRules!;
    }

    //use rule=================

}

/*
e.g.:

find parent replace，
	由top parent，一直replace到自己個層為止
	& addChild/remove Child event

全部 symbol，都優先找另一個model
	係個chain，第一個無，找第二個，最後先用自己





*/