///<reference path="../type_alias.d.ts"/>
export default abstract class MCDisplayObject extends PIXI.Sprite{
	
	public filtercache:Dictionary<PIXI.Filter>={};

	public getSonSon(_str:string):PIXI.DisplayObject | undefined{
		let arr=_str.split('.');
		let child:PIXI.DisplayObject=this;
		for(let a of arr){
			if(child instanceof PIXI.Container){
				child=(child as PIXI.Container).getChildByName(a);
				if(!child){
					return undefined;
				}
			}
		}
		return child;
	}
}