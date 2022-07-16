import {Matrix,Point} from '@pixi/math';
import { Container,IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import {BLEND_MODES} from '@pixi/constants';

import MC,{MCOption} from '../MC/MC';
import MCSymbolModel from '../MC/MCSymbolModel';
import MCTimeline from '../MC/MCTimeline';
import MCPlayer from '../MC/MCPlayer';
import {ColorMatrixAction,MCEffect,EffectGroup,EffectGroupAction} from '../MC/MCEffect';
import ASI from '../MC/ASI';
import {MCType,childData, LoopState,layerData,rawInstenceData, rawAsiData, frameData} from '../MC/MCStructure';

import * as TMath from '../utils/TMath';
import MCDisplayObject from '../MC/MCDisplayObject';
import MCSprite from '../MC/MCSprite';

import {MCReplacer,ReplacerDisplayObject,ReplaceRule} from './MCReplacer';
import MCLibrary from '../MC/MCLibrary';

export default class MCEX extends MC implements ReplacerDisplayObject{

    protected _replacer:MCReplacer=new MCReplacer(this);

    public get replacer():MCReplacer{
        return this._replacer;
    }

	protected layerEffects:Dictionary<EffectGroup>={};
    
    /*
	constructor(model:MCSymbolModel,option?:MCOption) {
        super(model,option);
    }
    */
    
    public showFloatFrame(_frame:float):void{
        if(Math.floor(_frame)===Math.ceil(_frame)){
            return
        }
        const rate:float=_frame-Math.floor(_frame);
		const floorFrameData=this.symbolModel.getFrame(Math.floor(_frame));
		const ceilFrameData=this.symbolModel.getFrame(Math.ceil(_frame));

        const newData:frameData=floorFrameData
        /*
        TODO..
        console.log(floorFrameData,ceilFrameData)
        for(let c of floorFrameData.child){
            //if()
        }
        console.log('showFloatFrame',_frame,rate)

        
        this.showFrameByData(newData,Math.floor(_frame))
        */
        this.showFrame(Math.floor(_frame));

    }

	protected showMCInner(obj:rawInstenceData,ly:layerData):[MCDisplayObject,Matrix]{
		let mc:MCDisplayObject;
        let currSymbolModel:MCSymbolModel=this.symbolModel.mcModel.symbolList[obj.SN];
        let changed:boolean=false;
        let m:Matrix=currSymbolModel.defaultMatrix?currSymbolModel.defaultMatrix.clone():new Matrix();

        //change slot by rule
        const modelKey:string=MCLibrary.getKeyFromModel(this.symbolModel.mcModel)!;
        const rules:ReplaceRule[]=this.replacer.rules;
        const effects:EffectGroup[]=[];
        for(const rule of rules){
            if( rule.type==='symbol' && 
                MCReplacer.checkMatch(obj.SN,rule) && 
                (rule.matchModelKey===undefined || rule.matchModelKey===modelKey)
            ){
                if(rule.replaceSymbol){
                    currSymbolModel=rule.replaceSymbol;
                }else if(rule.replaceKey){
                    const replacedName:string | undefined=MCReplacer.starReplace(obj.SN,rule.matchKey,rule.replaceKey);
                    if(replacedName){
                        if(rule.replaceModel && rule.replaceModel.symbolList[replacedName]){
                            currSymbolModel=rule.replaceModel.symbolList[replacedName];
                        }else if(this.symbolModel.mcModel.symbolList[replacedName]){
                            currSymbolModel=this.symbolModel.mcModel.symbolList[replacedName];
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
                changed=true;

                if(this.symbolModel.mcModel.symbolList[obj.SN]!==currSymbolModel){//after changed
                    if(currSymbolModel.defaultMatrix){
                        m=currSymbolModel.defaultMatrix.clone();
                    }
                    for(const rule of MCReplacer.defaultRules){
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
            }
        }

		let isSprite=currSymbolModel.isSprite;
		if(isSprite){
			mc=currSymbolModel.makeInstance()
		}else{
			mc=new MCEX(currSymbolModel,{player:this.player});
			(<MCEX>mc).type=obj.ST;
		}

        //change effect by rules
        for(const rule of rules){
            if(rule.type==='layer' && MCReplacer.checkMatch(ly.name,rule)){
                //console.log('layer')
                if(rule.effect){
                    effects.push(rule.effect);
                }
                changed=true;
            }
        }

        if(effects.length>1){
            let eg:EffectGroup=EffectGroupAction.create();
            for(const effect of effects){
                eg=EffectGroupAction.merge(eg,effect);
            }
            mc.addEffect(eg,'replace');
        }else if(effects.length===1){
            mc.addEffect(effects[0],'replace');
        }

        /*
        //layer effect
        if(this.layerEffects[ly.name]){
            mc.addEffect(this.layerEffects[ly.name],'layerEffect')
            //ch.extraEffects['layerEffect']=;
        }else if(ch.extraEffects['layerEffect']){
            mc.removeEffect('layerEffect')
            //delete ch.extraEffects['layerEffect'];
        }
        */

		return [mc,m];
	}
}