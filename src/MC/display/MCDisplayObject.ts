import { Filter } from 'pixi.js';
import { Sprite } from 'pixi.js';
import {MCEffect,type EffectGroup,EffectGroupAction} from '../effect';
//import '@pixi/mixin-get-child-by-name';

export default abstract class MCDisplayObject extends Sprite{
	public filtercache:Record<string,Filter>={};
	public baseEffect:EffectGroup;
	public extraEffects:Record<string,EffectGroup>={};
	public effectChanged:boolean=false;

	constructor(){
		super();
		this.baseEffect=EffectGroupAction.create();
	}

	public showEffect():void{//EffectGroup{


		if(!this.effectChanged)return;// this.baseEffect;
		let eg:EffectGroup=this.baseEffect;
		for(let k in this.extraEffects){
			eg=EffectGroupAction.merge(eg,this.extraEffects[k]);
		}
		EffectGroupAction.append(this,eg);
		//console.log('se2',eg);
		
		this.effectChanged=false;
		//return eg;
	}


	public addMCEffect(effect:EffectGroup,name:string):void{

		if(this.extraEffects[name] && EffectGroupAction.equalDeep(this.extraEffects[name],effect)){
			return
		}
		this.extraEffects[name]=effect;
		this.effectChanged=true;
	}

	public hasMCEffect(name:string):boolean{
		return this.extraEffects[name]===undefined;
	}

	public removeMCEffect(name:string):void{
		delete this.extraEffects[name];
		this.effectChanged=true;
	}

}