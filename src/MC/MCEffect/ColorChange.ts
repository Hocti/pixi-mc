import { ColorMatrix} from '@pixi/filter-color-matrix';

import * as Color from '../../utils/color';

import ColorMatrixAction from './ColorMatrixAction';

export enum TintType{
	none,
	flash,
	over
}

export default class ColorChange{
	
	private _brightness:float=0;
	private _saturation:float=0;
	private _hue:float=0;
	private _contrast:float=0;

	private _tintColor:uint=0;
	private _tintRate:float=0;
	private _tintType:TintType=TintType.none;

	public _colorMatrix:ColorMatrix;

	constructor(
			brightness:float=0,
			hue:float=0,
			saturation:float=0,
			contrast:float=0,
			tintColor:uint=0,
			tintRate:float=0,
			tintType:TintType=TintType.none
		){
		this._brightness=brightness;
		this._saturation=saturation;
		this._hue=hue;
		this._contrast=contrast;

		this._tintColor=tintColor;
		this._tintRate=tintRate;
		this._tintType=tintType;

		this._colorMatrix=this.renew();
	}

	public get brightness():float{
		return this._brightness;
	}

	public get hue():float{
		return this._hue;
	}

	public get saturation():float{
		return this._saturation;
	}

	public get contrast():float{
		return this._contrast;
	}

	public get tintColor():uint{
		return this._tintColor;
	}

	public get tintRate():float{
		return this._tintRate;
	}

	public get tintType():TintType{
		return this._tintType;
	}

	public get colorMatrix():ColorMatrix{
		return this._colorMatrix;
	}


	public set brightness(brightness:float){
		this._brightness=brightness;
		this.renew();
	}

	public set hue(hue:float){
		this._hue=hue;
		this.renew();
	}

	public set saturation(saturation:float){
		this._saturation=saturation;
		this.renew();
	}

	public set contrast(contrast:float){
		this._contrast=contrast;
		this.renew();
	}

	public set tintColor(_color:uint | string){
		if(Number(_color)!==NaN){
			this._tintColor=<uint>_color;
		}else{
			this._tintColor=Color.hashHexToNum(<string>_color)
		}
		
		if(this._tintType===TintType.none){
			this._tintType=TintType.over;
		}
		this.renew();
	}

	public set tintOver(_rate:float){
		this._tintRate=_rate;
		this._tintType=TintType.flash;
		this.renew();
	}

	public clearTintOver(){
		this._tintType=TintType.none;
		this.renew();
	}

	private renew():ColorMatrix{
		let m=ColorMatrixAction.create();

		if(this._tintType===TintType.flash){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.tint(this._tintColor,this._tintRate))
		}else if(this._tintType===TintType.over){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.tintOver(this._tintColor))
		}

		if(this._brightness!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.brightness(this._brightness))
		}
		if(this._hue!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.hue(this._hue))
		}
		if(this._saturation!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.saturation(this._saturation))
		}
		if(this._contrast!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.contrast(this._contrast))
		}
		this._colorMatrix=m;
		return m
	}

}