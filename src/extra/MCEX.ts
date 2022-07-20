import {Matrix,Point} from '@pixi/math';

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
import IMCSprite from '../MC/IMCSprite';

import {MCReplacer,IreplacerDisplayObject,ReplacerResult} from './MCReplacer';
import MCLibrary from '../MC/MCLibrary';

export default class MCEX extends MC implements IreplacerDisplayObject{
    
    public showFloatFrame(_frame:float):void{
        if(Math.floor(_frame)===Math.ceil(_frame)){
            return
        }
        /*
		const floorFrameData=this.symbolModel.getFrame(Math.floor(_frame));
        const rate:float=_frame-Math.floor(_frame);
		const ceilFrameData=this.symbolModel.getFrame(Math.ceil(_frame));
        const newData:frameData=floorFrameData


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

    //replacer=====================

	constructor(model:MCSymbolModel,option?:MCOption) {
        super(model,option); 
    }

    public replacer:MCReplacer=new MCReplacer(this);

    public onRenew():void{
        //console.log('onRenew',this.symbolModel.name)
        this.needRedraw=true;
        this.replacer.cleanCache();
    }

	protected showMC(data:rawInstenceData,ly:layerData):[string,MCDisplayObject,Matrix]{
		let name:string=this.getUniName(`L${ly.num}|${data.SN}|${data.IN}|${data.ST}`);
		let child:IMCSprite=<IMCSprite>this.search(name);

        let {symbolModel,matrix,effect}=this.replacer.getReplace(data.SN,ly.name);

		if(!child || symbolModel!==child.symbolModel){
            if(child){
                this.removeChild(child);
            }
			child=this.createFromSymbol(symbolModel,data);
		}
        
        if(effect){
            child.addEffect(effect,'replace');
        }

		return [name,child,matrix];
	}
}

/*

	protected layerEffects:Dictionary<EffectGroup>={};
    
    

    //layer effect
    if(this.layerEffects[ly.name]){
        mc.addEffect(this.layerEffects[ly.name],'layerEffect')
        //ch.extraEffects['layerEffect']=;
    }else if(ch.extraEffects['layerEffect']){
        mc.removeEffect('layerEffect')
        //delete ch.extraEffects['layerEffect'];
    }
*/