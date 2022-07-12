import { Filter } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import {Matrix,Point} from '@pixi/math';
import {MCEffect,EffectGroup,EffectGroupAction} from './MCEffect';

export default abstract class MCDisplayObject extends Sprite{
	public filtercache:Dictionary<Filter>={};
	public baseEffect:EffectGroup;
	public extraEffects:Dictionary<EffectGroup>={};

	//debug
	public temp_matrix:{
		m2d?:Matrix,
		m2d2?:Matrix,
		TRP?:{
			x:float,
			y:float
		}
	}={}

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

	protected effectChanged:boolean=false;

	public addEffect(effect:EffectGroup,name:string):void{
		this.extraEffects[name]=effect;
		this.effectChanged=true;
	}

	public containEffect(name:string):boolean{
		return this.extraEffects[name]===undefined;
	}

	public removeEffect(name:string):void{
		delete this.extraEffects[name];
		this.effectChanged=true;
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