import {Matrix} from 'pixi.js';

import {MC,MCOption,MCDisplayObject,IMCSprite} from '../MC/display/';
import {layerData,rawInstenceData,childData} from '../MC/model/MCStructure';
import {MCSymbolModel} from '../MC/model/';
import type {EffectGroup} from '../MC/effect/';

import {MCReplacer,IreplacerDisplayObject,ReplacerResult} from './MCReplacer';
//import '@pixi/mixin-cache-as-bitmap';

//extended MC, with replacer child and layer effect
export default class MCEX extends MC implements IreplacerDisplayObject{
    
    public showFloatFrame(_frame:number):void{
        if(Math.floor(_frame)===Math.ceil(_frame)){
            return
        }
        /*
		const floorFrameData=this.symbolModel.getFrame(Math.floor(_frame));
        const rate:number=_frame-Math.floor(_frame);
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

	protected showMC(data:rawInstenceData,ly:layerData):[string,MCDisplayObject,Matrix]{
		let name:string=this.getUniName(`L${ly.num}|${data.SN}|${data.IN}|${data.ST}`);
		let child:IMCSprite=<IMCSprite>this.search(name);

        let {symbolModel,matrix,effect}=this.replacer.getReplace(data.SN,ly.name);

		if(!child || symbolModel!==child.symbolModel){
            if(child && !child.destroyed){
                child.destroy();
            }
			child=this.createFromSymbol(symbolModel,data);
		}
        
        //replace effect
        if(effect){
            child.addMCEffect(effect,'replace');
        }else{
            child.removeMCEffect('replace')
        }

		return [name,child,matrix];
	}

    public replacer:MCReplacer=new MCReplacer(this);

    public onRenew():void{
        //console.log('onRenew',this.symbolModel.name)
        this.effectChanged=true;
        this.needRedraw=true;
        //this.cacheAsBitmap=false;

        //this.layerEffectUpdate=true;
    }

    //layer effect=================

	protected layerEffects:Record<string,EffectGroup>={};

    public setLayerEffect(layerName:string,eg:EffectGroup):void{
        this.layerEffects[layerName]=eg;
        this.onRenew();
    }
    
    public hasLayerEffect(layerName:string):boolean{
        return this.layerEffects[layerName]!==undefined;
    }

    public removeLayerEffect(layerName:string):void{
        delete this.layerEffects[layerName];
        this.onRenew();
    }
    
	protected showChild(obj:childData,ly:layerData):MCDisplayObject{
        const mdo:MCDisplayObject=super.showChild(obj,ly);
        //layer effect
        if(this.layerEffects[ly.name]){//(this.layerEffectUpdate || !mdo.extraEffects['layerEffect']) && 
            mdo.addMCEffect(this.layerEffects[ly.name],'layerEffect')
        }else if(mdo.extraEffects['layerEffect'] && !this.layerEffects[ly.name]){
            mdo.removeMCEffect('layerEffect')
        }

        return mdo;
    }

    /*
    protected layerEffectUpdate:boolean=false;
    
	public showFrame(frame:uint):void{
        super.showFrame(frame);
        this.layerEffectUpdate=false;
    }
    */
}