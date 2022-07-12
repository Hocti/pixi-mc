import {Matrix,Point} from '@pixi/math';
import { Container,IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import {BLEND_MODES} from '@pixi/constants';

import MC from '../MC/MC';
import MCSymbolModel from '../MC/MCSymbolModel';
import MCTimeline from '../MC/MCTimeline';
import MCPlayer from '../MC/MCPlayer';
import {ColorMatrixAction,MCEffect,EffectGroup,EffectGroupAction} from '../MC/MCEffect';
import ASI from '../MC/ASI';
import {MCType,childData, LoopState,layerData,rawInstenceData, rawAsiData} from '../MC/MCStructure';

import * as TMath from '../utils/TMath';
import MCDisplayObject from '../MC/MCDisplayObject';

export type ReplaceRule={
    
}

export class MCReplacer{

    public addReplaceRule(_rule:ReplaceRule):void{
		
    }
}

export class MCReplace extends MC{

    public MCReplacer?:MCReplacer;
    
	protected showChildInner(data:rawInstenceData | rawAsiData,isMC:boolean,layerNum:uint):[string,MCDisplayObject,Matrix]{

		if(isMC){
			return this.showMC(data! as rawInstenceData,layerNum);
		}else{
			return this.showASI(data! as rawAsiData,layerNum);
		}
	}
}