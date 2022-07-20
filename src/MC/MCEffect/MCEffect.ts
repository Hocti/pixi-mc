import { Filter } from '@pixi/core';
import { BlurFilter } from '@pixi/filter-blur';
import { ColorMatrixFilter,ColorMatrix} from '@pixi/filter-color-matrix';
import {BevelFilter,DropShadowFilter,GlowFilter,GlowFilterOptions,MultiColorReplaceFilter} from 'pixi-filters';
import {BLEND_MODES} from '@pixi/constants';

import * as Color from '../../utils/color';
import * as TMath from '../../utils/TMath';
import {checkArrayEqual} from '../../utils/utils'
import {colorData,filterData} from '../MCStructure'
import MCDisplayObject from '../MCDisplayObject';


import ColorMatrixAction from './ColorMatrixAction';

declare type Color = number;
const baseTintColors=[0xff0000,0xff00,0xff,0xffff00,0xff00ff,0xffff];

export default class MCEffect {

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
		let newAlpha:float=obj.baseEffect.alpha;
		if(_fData){
			if(_fData.BLF){//blur
				let b=<BlurFilter>(MCEffect.getFilterCache(obj,'BlurFilter',_prefix));
				b.blurX=_fData.BLF.BLX
				b.blurY=_fData.BLF.BLY
				b.quality =Math.min(Math.max(_fData.BLF.BLY,_fData.BLF.BLX)/2,11)
				currfilter.push(b)
			}
			if(_fData.GF){//glow
				let f=<GlowFilter>MCEffect.getFilterCache(obj,'GlowFilter',_prefix,{
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
			if(_cData.M==='CA'){//CA
				newAlpha=_cData.AM;
			}else{
				newAlpha=1;
			}
			let cmatrix:ColorMatrix | undefined;
			if(_cData.BRT!=undefined){//Brightness
				cmatrix = ColorMatrixAction.flashBrightness(Number(_cData.BRT));
			}else if(_cData.TC!=undefined){//Tint
				cmatrix = ColorMatrixAction.tint(_cData.TC,Number(_cData.TM));
			}else if(_cData.M==='AD'){
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
			newAlpha=1
		}
		//TODO: remove unuse filter?
		if(obj.baseEffect.alpha!==newAlpha || !checkArrayEqual<Filter>(obj.baseEffect.filters,currfilter)){
			obj.baseEffect.alpha=newAlpha;
			obj.baseEffect.filters=currfilter;
			obj.effectChanged=true;
		}
	}

	public static tint(obj:MCDisplayObject,colors:uint[],bw?:{black?:uint,white?:uint},epsilon:float=0.01):void{
		const tintArray:[Color, Color][]=[];
		for(let i:uint=0,t:uint=Math.min(colors.length,6);i<t;i++){
			tintArray.push([baseTintColors[i],colors[i]]);
		}
		if(bw){
			if(bw.black!==undefined){
				tintArray.push([0,bw.black]);
			}
			if(bw.white!==undefined){
				tintArray.push([0xffffff,bw.white]);
			}
		}
		//console.log(tintArray)
		if(!obj.filtercache['multiTint']){
			obj.filtercache['multiTint']=new MultiColorReplaceFilter(tintArray,epsilon,tintArray.length);
		}else{
			(<MultiColorReplaceFilter>obj.filtercache['multiTint']).replacements=tintArray;
			(<MultiColorReplaceFilter>obj.filtercache['multiTint']).epsilon=epsilon;
		}
		if(obj.filters?.indexOf(obj.filtercache['multiTint'])===-1){
			obj.filters?.push(obj.filtercache['multiTint'])
		}
		//console.log(obj.filters,obj.filtercache)
		//obj.cacheAsBitmap=true;
	}

	public static removeTint(obj:MCDisplayObject):void{
		if(obj.filtercache['multiTint']){
			const fid:int=obj.filters!.indexOf(obj.filtercache['multiTint'])
			if(fid>=0){
				obj.filters!.splice(fid, 1);
			}
			//obj.filtercache['multiTint'].destroy();
			console.log(obj.filters,obj.filtercache)
		}
	}
	
	private static getFilterCache(obj:MCDisplayObject,_key:string,_prefix:string='',_option?:{quality:float,distance:float}):Filter{
		const cacheName=`${_prefix}${_key}`
		if(!obj.filtercache[cacheName]){
			if(_key==="ColorMatrixFilter"){
				obj.filtercache[cacheName]=new ColorMatrixFilter()
			}else if(_key==="BlurFilter"){
				obj.filtercache[cacheName]=new BlurFilter()
			}else if(_key==="DropShadowFilter"){
				obj.filtercache[cacheName]=new DropShadowFilter()
			}else if(_key==="GlowFilter"){
				obj.filtercache[cacheName]=new GlowFilter(<GlowFilterOptions>{
					quality:_option?_option.quality:1,
					distance:_option?_option.distance:10
				})
			}else if(_key==="BevelFilter"){
				obj.filtercache[cacheName]=new BevelFilter()
			}else if(_key==="AdjustmentFilter"){
				obj.filtercache[cacheName]=new ColorMatrixFilter()
				//obj.filtercache[cacheName]=new AdjustmentFilter()
			}
		}
		return obj.filtercache[cacheName];
	}
}