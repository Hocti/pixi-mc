import { Filter } from '@pixi/core';
import { Container,DisplayObject } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import {effect,MCEffect} from './MCEffect'

export default abstract class MCDisplayObject extends Sprite{
	public filtercache:Dictionary<Filter>={};
}

/*

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