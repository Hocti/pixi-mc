import {Matrix} from '@pixi/math';

import {MC,MCOption,MCDisplayObject,IMCSprite} from '../MC/display/';
import {layerData,rawInstenceData,childData} from '../MC/model/MCStructure';
import {MCSymbolModel} from '../MC/model/';
import {EffectGroup} from '../MC/effect/';

import {MCReplacer,IreplacerDisplayObject,ReplacerResult} from './MCReplacer';

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

	protected showMC(data:rawInstenceData,ly:layerData):[string,MCDisplayObject,Matrix]{
		let name:string=this.getUniName(`L${ly.num}|${data.SN}|${data.IN}|${data.ST}`);
		let child:IMCSprite=<IMCSprite>this.search(name);

        let {symbolModel,matrix,effect}=this.replacer.getReplace(data.SN,ly.name);

		if(!child || symbolModel!==child.symbolModel){
            if(child){
                this.removeChild(child);
                child.destroy()
            }
			child=this.createFromSymbol(symbolModel,data);
		}
        
        //replace effect
        if(effect){
            child.addEffect(effect,'replace');
        }else{
            child.removeEffect('replace')
        }

		return [name,child,matrix];
	}
    
	protected showChild(obj:childData,ly:layerData):MCDisplayObject{
        const mdo:MCDisplayObject=super.showChild(obj,ly);

        //layer effect
        if(!mdo.extraEffects['layerEffect'] && this.layerEffects[ly.name]){
            mdo.addEffect(this.layerEffects[ly.name],'layerEffect')
        }else if(mdo.extraEffects['layerEffect'] && !this.layerEffects[ly.name]){
            mdo.removeEffect('layerEffect')
        }

        return mdo;
    }

    //replacer=====================

    public replacer:MCReplacer=new MCReplacer(this);

    public onRenew():void{
        //console.log('onRenew',this.symbolModel.name)
        this.needRedraw=true;
        this.replacer.cleanCache();
        this.cacheAsBitmap=false;
    }

    //layer effect=================

	protected layerEffects:Dictionary<EffectGroup>={};

    public addLayerEffect(layerName:string,eg:EffectGroup):void{
        this.layerEffects[layerName]=eg;
        console.log(layerName,eg)
        this.needRedraw=true;
    }

    public removeLayerEffect(layerName:string):void{
        delete this.layerEffects[layerName];
        this.needRedraw=true;
    }
}