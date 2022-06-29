import { Filter } from '@pixi/core';
import { Sprite } from '@pixi/sprite';

import {MCEffect,EffectGroup,EffectGroupAction} from './MCEffect';

export default abstract class MCDisplayObject extends Sprite{
	public filtercache:Dictionary<Filter>={};
	public baseEffect:EffectGroup;
	public extraEffects:Dictionary<EffectGroup>={};

	constructor(){
		super();
		this.baseEffect=EffectGroupAction.create();
	}

	public showEffect():void{
		let eg:EffectGroup=this.baseEffect;
		for(let k in this.extraEffects){
			eg=EffectGroupAction.merge(eg,this.extraEffects[k]);
		}
		EffectGroupAction.append(this,eg);
	}

}

/*
import { Container,DisplayObject } from '@pixi/display';
import {effect,MCEffect} from './MCEffect'

	protected destroyOption={
		children:true,texture:false
	}


	public timelineEffect:effect=MCEffect.defaultEffect();

	public getSonSon(_str:string):DisplayObject | undefined{
		let arr=_str.split('.');
		let currDO:DisplayObject=this as DisplayObject;
		for(let a of arr){
			if(currDO instanceof Container){
				currDO=(currDO as Container).getChildByName(a);
				if(!currDO){
					return undefined;
				}
			}
		}
		return currDO;
	}

*/