import {BLEND_MODES} from 'pixi.js';
import { Filter } from 'pixi.js';
import { ColorMatrix} from 'pixi.js';

import MCDisplayObject from '../display/MCDisplayObject';
import ColorMatrixAction from './ColorMatrixAction';
import MCEffect from './MCEffect';
import {BLEND_MODES_NORMAL} from '../../utils/blendmode';

export type EffectGroup = {
	visible:boolean,
	filters:Filter[],
	alpha:number,
	colorMatrix?:ColorMatrix,
	blendMode:BLEND_MODES
}

export class EffectGroupAction{

	public static create():EffectGroup{
		return {
			visible:true,
			filters:[],
			alpha:1,
			//colorMatrix:ColorMatrixAction.create(),
			blendMode:BLEND_MODES_NORMAL
		}
	}

	public static clone(_effect:EffectGroup):EffectGroup{
		return {
			visible:_effect.visible,
			alpha:_effect.alpha,
			blendMode:_effect.blendMode,
			filters:[..._effect.filters],
			colorMatrix:_effect.colorMatrix?ColorMatrixAction.clone(_effect.colorMatrix):undefined
		}
	}

	/*
	public static equalSimple(_effect1:EffectGroup,_effect2:EffectGroup):boolean{
		return _effect1.visible==_effect2.visible && 
		_effect1.alpha==_effect2.alpha && 
		_effect1.blendMode==_effect2.blendMode
	}
	*/

	public static equalDeep(_effect1:EffectGroup,_effect2:EffectGroup):boolean{
		return _effect1===_effect2 || (
		_effect1.visible==_effect2.visible && 
		_effect1.alpha==_effect2.alpha && 
		_effect1.blendMode==_effect2.blendMode &&
		(
			(!_effect1.colorMatrix && !_effect2.colorMatrix) ||
			(_effect1.colorMatrix!.toString()===_effect2.blendMode!.toString())
		) &&
		_effect1.filters.length==_effect2.filters.length &&
		_effect1.filters.every((v,i)=>v==_effect2.filters[i])
		)
	}

	public static merge(_effect1:EffectGroup,_effect2:EffectGroup):EffectGroup{
		//console.log('merge,',_effect1.blendMode,_effect2.blendMode)
		return {
			visible:_effect1.visible && _effect2.visible,
			filters:[..._effect1.filters,..._effect2.filters],//unique?
			alpha:_effect1.alpha*_effect2.alpha,
			colorMatrix:_effect1.colorMatrix&&_effect2.colorMatrix?ColorMatrixAction.multiply(_effect1.colorMatrix,_effect2.colorMatrix):(_effect1.colorMatrix?_effect1.colorMatrix:(_effect2.colorMatrix?_effect2.colorMatrix:undefined)),
			blendMode:(_effect1.blendMode!==BLEND_MODES_NORMAL?_effect1.blendMode:_effect2.blendMode)
		}
	}

	public static append(_obj:MCDisplayObject,_effect:EffectGroup):void{
		/*
		if(_obj instanceof  MC && (<MC>_obj).symbolModel.name==='Symbol 11'){
			console.log('append,',_effect.blendMode)
		}
		*/

		_obj.visible=_effect.visible;
		_obj.alpha=_effect.alpha;
		_obj.blendMode=_effect.blendMode;
		_obj.filters=[...new Set(_effect.filters)];
		if(_effect.colorMatrix){
			MCEffect.setColorMatrix(_obj,_effect.colorMatrix,"mixed_")
		}
	}
}