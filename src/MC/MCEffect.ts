import { Filter } from '@pixi/core';
import { BlurFilter } from '@pixi/filter-blur';
import { ColorMatrixFilter,ColorMatrix} from '@pixi/filter-color-matrix';
import {BevelFilter,DropShadowFilter,GlowFilter,GlowFilterOptions} from 'pixi-filters';
import {BLEND_MODES} from '@pixi/constants';

import * as Color from '../utils/color';
import * as TMath from '../utils/TMath';
import MCDisplayObject from './MCDisplayObject';
import {colorData,filterData} from './MCStructure'

export enum TintType{
	none,
	flash,
	over
}

const DELTA_INDEX:float[] = [
	0,    0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1,  0.11,
	0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
	0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
	0.44, 0.46, 0.48, 0.5,  0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 
	0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
	1.0,  1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
	1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0,  2.12, 2.25, 
	2.37, 2.50, 2.62, 2.75, 2.87, 3.0,  3.2,  3.4,  3.6,  3.8,
	4.0,  4.3,  4.7,  4.9,  5.0,  5.5,  6.0,  6.5,  6.8,  7.0,
	7.3,  7.5,  7.8,  8.0,  8.4,  8.7,  9.0,  9.4,  9.6,  9.8, 
	10.0
];

export class ColorMatrixAction{
	
	public static create():ColorMatrix{
		return [
			1, 0, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
	}
	
	public static clone(p1:ColorMatrix):ColorMatrix{
		let newArr:float[]=[];
		for(let i=0;i<=19;i++){
			newArr[i]=p1[i];
		}
		return newArr as ColorMatrix;
	}

	public static multiply(_p1:ColorMatrix,_p2:ColorMatrix):ColorMatrix {
		let p1:float[]=[..._p1,0, 0, 0, 0, 1]
		let p2:float[]=[..._p2,0, 0, 0, 0, 1]

		let col:float[] = [];
		//let rem=ColorMatrixAction.clone(p1)
		for (let i:float=0;i<5;i++) {
			for (let j:float=0;j<5;j++) {
				col[j] = p1[j+i*5];
			}
			for (let j:float=0;j<5;j++) {
				let val:float=0;
				for (let k:float=0;k<5;k++) {
					val += p2[j+k*5]*col[k];
				}
				p1[j+i*5] = val;
			}
		}
		return p1.slice(0, 20) as ColorMatrix;
	}

	
	public static tintOver(_color:string | uint):ColorMatrix{
		let rgb=Color.getRGB(Color.hashHexToNum(String(_color)));
		let cmatrix:ColorMatrix=[
			0,1,0,0,rgb.r/255,
			0,1,0,0,rgb.g/255,
			0,1,0,0,rgb.b/255,
			0, 0, 0, 1, 0,
			//0,0,0, 0, 1
		];
		return ColorMatrixAction.multiply(cmatrix,ColorMatrixAction.saturation(-100));
	}

	public static tint(_color:string | uint,m:float=1):ColorMatrix{
		let rgb=Color.getRGB(Color.hashHexToNum(String(_color)));
		let cmatrix:ColorMatrix=[
			1-m, 0, 0, 0, rgb.r*m/255,
			0, 1-m, 0, 0, rgb.g*m/255,
			0, 0, 1-m, 0, rgb.b*m/255,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}
	
	public static flashBrightness(b:float):ColorMatrix{
		if(!Number(b)){
			return ColorMatrixAction.create();
		}
		if(b>0){
			return [
				1-b, 0, 0, 0, b,
				0, 1-b, 0, 0, b,
				0, 0, 1-b, 0, b,
				0, 0, 0, 1, 0,
				//0, 0, 0, 0, 1
			];
		}
		return [
			1+b, 0, 0, 0, 0,
			0, 1+b, 0, 0, 0,
			0, 0, 1+b, 0, 0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
	}

	public static set4(_brightness:float=0,_hue:float=0,_saturation:float=0,_contrast:float=0):ColorMatrix{
		let m=ColorMatrixAction.create();
		if(_brightness!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.brightness(_brightness))
		}
		if(_hue!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.hue(_hue))
		}
		if(_saturation!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.saturation(_saturation))
		}
		if(_contrast!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.contrast(_contrast))
		}
		return m;
	}

	public static brightness(b:float):ColorMatrix{
		if(!Number(b)){
			return ColorMatrixAction.create();
		}
		let cmatrix:ColorMatrix=[
			1, 0, 0, 0, b,
			0, 1, 0, 0, b,
			0, 0, 1, 0, b,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

	public static hue(p_val:float=1 ):ColorMatrix{
		if(!Number(p_val)){
			return ColorMatrixAction.create();
		}
		p_val = TMath.cleanValue(p_val,180)/180*Math.PI;
		let cosVal:float = Math.cos(p_val);
		let sinVal:float = Math.sin(p_val);
		let lumR:float = 0.213;
		let lumG:float = 0.715;
		let lumB:float = 0.072;
		let cmatrix:ColorMatrix=[
			lumR+cosVal*(1-lumR)+sinVal*(-lumR),lumG+cosVal*(-lumG)+sinVal*(-lumG),lumB+cosVal*(-lumB)+sinVal*(1-lumB),0,0,
			lumR+cosVal*(-lumR)+sinVal*(0.143),lumG+cosVal*(1-lumG)+sinVal*(0.140),lumB+cosVal*(-lumB)+sinVal*(-0.283),0,0,
			lumR+cosVal*(-lumR)+sinVal*(-(1-lumR)),lumG+cosVal*(-lumG)+sinVal*(lumG),lumB+cosVal*(1-lumB)+sinVal*(lumB),0,0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

	public static saturation(p_val:float=0):ColorMatrix{
		if(!Number(p_val)){
			return ColorMatrixAction.create();
		}
		p_val = TMath.cleanValue(p_val,100)
		let x:float = 1+((p_val > 0) ? 3*p_val/100 : p_val/100);
		let lumR:float = 0.3086;
		let lumG:float = 0.6094;
		let lumB:float = 0.0820;
		let cmatrix:ColorMatrix=[
			lumR*(1-x)+x,lumG*(1-x),lumB*(1-x),0,0,
			lumR*(1-x),lumG*(1-x)+x,lumB*(1-x),0,0,
			lumR*(1-x),lumG*(1-x),lumB*(1-x)+x,0,0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

	public static contrast(p_val:float=0):ColorMatrix{//-100~100
		if(!Number(p_val)){
			return ColorMatrixAction.create();
		}

		p_val = TMath.cleanValue(p_val,100)
		
		let x:float;
		if (p_val<0) {
			x = 50+p_val/100*50
		} else {
			x = p_val%1;
			if (x == 0) {
				x = DELTA_INDEX[p_val];
			} else {
				x = DELTA_INDEX[(p_val<<0)]*(1-x)+DELTA_INDEX[(p_val<<0)+1]*x;
				// use linear interpolation for more granularity.
			}
			x = x*50+50;
		}
		let cmatrix:ColorMatrix=[
			x/50,0,0,0,0.5*(50-x)/100,
			0,x/50,0,0,0.5*(50-x)/100,
			0,0,x/50,0,0.5*(50-x)/100,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

}

export class MCEffect {

	public static setColorMatrix(obj:MCDisplayObject,cmatrix:ColorMatrix,_prefix:string=''):void{
		let filter=<ColorMatrixFilter>(MCEffect.getFilterCache(obj,'ColorMatrixFilter',_prefix));
		filter.matrix=cmatrix as ColorMatrix;
		
		if(!obj.filters){
			obj.filters=[];
		}
		if(obj.filters && obj.filters.indexOf(filter)<0){
			obj.filters.push(filter);
		}
	}

	//change MCDisplayObject's baseEffect only
	public static setRawColorAndFilter(obj:MCDisplayObject,_cData?:colorData,_fData?:filterData,_prefix:string=''){
		let currfilter:Filter[]=[];
		if(_fData){
			if(_fData.BLF){//blur
				let b=<BlurFilter>(MCEffect.getFilterCache(obj,'BlurFilter',_prefix));
				b.blurX=_fData.BLF.BLX
				b.blurY=_fData.BLF.BLY
				b.quality =Math.min(Math.max(_fData.BLF.BLY,_fData.BLF.BLX)/2,11)
				currfilter.push(b)
			}
			if(_fData.GF){//glow
				let f=<GlowFilter>MCEffect.getFilterCache(obj,'GlowFilter',_prefix,<GlowFilterOptions>{
					quality:_fData.GF.Q/100,
					distance:_fData.GF.BLX
				});
				//f.quality=_fData.GF.Q/200;
				//f.distance=_fData.GF.BLX;
				f.color=Color.hashHexToNum(_fData.GF.C);
				f.knockout=_fData.GF.KK;
				f.outerStrength=_fData.GF.IN?0:_fData.GF.STR;
				f.innerStrength=_fData.GF.IN?_fData.GF.STR:0;
				currfilter.push(f);
			}
			if(_fData.DSF){//drop shadow
				let f=<DropShadowFilter>(MCEffect.getFilterCache(obj,'DropShadowFilter',_prefix));
				f.alpha=_fData.DSF.STR;
				f.blur=_fData.DSF.BLX/4; 
				f.color=Color.hashHexToNum(_fData.DSF.C);
				f.rotation=_fData.DSF.AL; 
				f.shadowOnly=_fData.DSF.HO; 
				f.distance=_fData.DSF.DST; 
				f.quality=_fData.DSF.Q*3;
				currfilter.push(f);
			}
			if(_fData.BF){//Bevel
				let f=<BevelFilter>(MCEffect.getFilterCache(obj,'BevelFilter',_prefix));
				f.rotation=_fData.BF.AL; 
				f.thickness=_fData.BF.DST; 
				f.lightColor=Color.hashHexToNum(_fData.BF.HC);
				f.lightAlpha=_fData.BF.HA;
				f.shadowColor=Color.hashHexToNum(_fData.BF.SC); 
				f.shadowAlpha=_fData.BF.SA;
				currfilter.push(f);
			}
			if(_fData.ACF){//adjust color

				let cmfilter=<ColorMatrixFilter>(MCEffect.getFilterCache(obj,'AdjustmentFilter',_prefix));
				//let acffilter=<AdjustmentFilter>(MCEffect.getFilterCache(obj,'AdjustmentFilter'));

				cmfilter.matrix=ColorMatrixAction.set4(
					Number(_fData.ACF.BRT)*0.004,
					Number(_fData.ACF.H),
					Number(_fData.ACF.SAT),
					Number(_fData.ACF.CT)
				) as ColorMatrix;
				

				currfilter.push(cmfilter);
			}
		}
		if(_cData){
			if(_cData.M=='CA'){//CA
				obj.baseEffect.alpha=_cData.AM;
			}else{
				obj.baseEffect.alpha=1;
			}
			let cmatrix:ColorMatrix | undefined;
			if(_cData.BRT!=undefined){//Brightness
				cmatrix = ColorMatrixAction.flashBrightness(Number(_cData.BRT));
			}else if(_cData.TC!=undefined){//Tint
				cmatrix = ColorMatrixAction.tint(_cData.TC,Number(_cData.TM));
			}else if(_cData.M=='AD'){
				cmatrix = [
					_cData.RM, 0, 0, 0, _cData.RO/255,
					0, _cData.GM, 0, 0, _cData.GO/255,
					0, 0, _cData.BM, 0, _cData.BO/255,
					0, 0, 0, _cData.AM+_cData.AO/255,0];//_cData.AM, _cData.AO/255];
			}
			if(cmatrix){
				let filter=<ColorMatrixFilter>(MCEffect.getFilterCache(obj,'ColorMatrixFilter','CA_'+_prefix));
				filter.matrix=cmatrix as ColorMatrix;
				currfilter.push(filter);
				//MCEffect.setColorMatrix(obj,cmatrix,'CA_'+_prefix)
			}
		}else{
			obj.baseEffect.alpha=1
		}
		//TODO: remove unuse filter?
		obj.baseEffect.filters=currfilter;
	}
	
	private static getFilterCache(obj:MCDisplayObject,_key:string,_prefix:string='',_option?:GlowFilterOptions):Filter{
		const cacheName=`${_prefix}${_key}`
		if(!obj.filtercache[cacheName]){
			if(_key=="ColorMatrixFilter"){
				obj.filtercache[cacheName]=new ColorMatrixFilter()
			}else if(_key=="BlurFilter"){
				obj.filtercache[cacheName]=new BlurFilter()
			}else if(_key=="DropShadowFilter"){
				obj.filtercache[cacheName]=new DropShadowFilter()
			}else if(_key=="GlowFilter"){
				obj.filtercache[cacheName]=new GlowFilter(_option)
			}else if(_key=="BevelFilter"){
				obj.filtercache[cacheName]=new BevelFilter()
			}else if(_key=="AdjustmentFilter"){
				obj.filtercache[cacheName]=new ColorMatrixFilter()
				//obj.filtercache[cacheName]=new AdjustmentFilter()
			}
		}
		return obj.filtercache[cacheName];
	}
}

export class EffectGroupAction{

	public static create():EffectGroup{
		return {
			visible:true,
			filters:[],
			alpha:1,
			//colorMatrix:ColorMatrixAction.create(),
			blendMode:BLEND_MODES.NORMAL
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

	public static merge(_effect1:EffectGroup,_effect2:EffectGroup):EffectGroup{
		return {
			visible:_effect1.visible && _effect2.visible,
			filters:[..._effect1.filters,..._effect2.filters],//unique?
			alpha:_effect1.alpha*_effect2.alpha,
			colorMatrix:_effect1.colorMatrix&&_effect2.colorMatrix?ColorMatrixAction.multiply(_effect1.colorMatrix,_effect2.colorMatrix):(_effect1.colorMatrix?_effect1.colorMatrix:(_effect2.colorMatrix?_effect2.colorMatrix:undefined)),
			blendMode:(_effect1.blendMode!==BLEND_MODES.NORMAL?_effect1.blendMode:_effect2.blendMode)
		}
	}

	public static append(_obj:MCDisplayObject,_effect:EffectGroup):void{
		_obj.visible=_effect.visible;
		_obj.alpha=_effect.alpha;
		_obj.blendMode=_effect.blendMode;
		_obj.filters=[...new Set(_effect.filters)];
		if(_effect.colorMatrix){
			MCEffect.setColorMatrix(_obj,_effect.colorMatrix,"mixed_")
		}
	}
}







export type EffectGroup={
	visible:boolean,
	filters:Filter[],
	alpha:float,
	colorMatrix?:ColorMatrix,
	blendMode:BLEND_MODES
}

export class ColorChange{
	
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
		
		if(this._tintType==TintType.none){
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