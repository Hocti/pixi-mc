import * as Color from '../utils/color';
import MCDisplayObject from './MCDisplayObject';

export default class MCEffect {

	static setEffect(_cData:any,_fData:any,obj:MCDisplayObject){
		let currfilter:PIXI.Filter[]=[];
		if(_cData!=undefined){
			if(_cData.M=='CA'){//CA
				obj.alpha=_cData.AM
			}else{
				obj.alpha=1
			}
			let cmatrix:float[]=[];
			if(_cData.BRT!=undefined){
				let b=Number(_cData.BRT);
				if(b>0){
					cmatrix = [
						1-b, 0, 0, 0, b,
						0, 1-b, 0, 0, b,
						0, 0, 1-b, 0, b,
						0, 0, 0, 1, 0];
				}else if(b<0){
					cmatrix = [
						1+b, 0, 0, 0, 0,
						0, 1+b, 0, 0, 0,
						0, 0, 1+b, 0, 0,
						0, 0, 0, 1, 0];
				}
			}else if(_cData.TC!=undefined){//T
				let rgb=Color.getRGB(Color.hashHexToNum(_cData.TC))//PIXI.utils.hex2rgb(_cData.TC)
				let m=Number(_cData.TM)
				cmatrix = [
					1-m, 0, 0, 0, rgb.r*m/255,
					0, 1-m, 0, 0, rgb.g*m/255,
					0, 0, 1-m, 0, rgb.b*m/255,
					0, 0, 0, 1, 0];
			}else if(_cData.M=='AD'){
				cmatrix = [
					_cData.RM, 0, 0, 0, _cData.RO/255,
					0, _cData.GM, 0, 0, _cData.GO/255,
					0, 0, _cData.BM, 0, _cData.BO/255,
					0, 0, 0, _cData.AM+_cData.AO/255,0];//_cData.AM, _cData.AO/255];
			}
			if(cmatrix.length>0){
				//let filter=new PIXI.filters.ColorMatrixFilter();
				let filter=<PIXI.filters.ColorMatrixFilter>(MCEffect.getFilter(obj,'ColorMatrixFilter'));
				filter.matrix=cmatrix;
				currfilter.push(filter);
			}
		}else{
			obj.alpha=1
		}
		if(_fData){
			for(let filter in _fData){
				if(filter=="BLF"){//blur
					let b=<PIXI.filters.BlurFilter>(MCEffect.getFilter(obj,'BlurFilter'));
					b.blurX=_fData[filter].BLX
					b.blurY=_fData[filter].BLY
					b.quality =Math.min(Math.max(_fData[filter].BLY,_fData[filter].BLX)/2,11)
					currfilter.push(b)
				}else if(filter=="GF"){//glow
					let f=<PIXI.filters.GlowFilter>MCEffect.getFilter(obj,'GlowFilter',<PIXI.filters.GlowFilterOptions>{
						quality:_fData[filter].Q/200,
						distance:_fData[filter].BLX
					});
					//f.quality=_fData[filter].Q/200;
					//f.distance=_fData[filter].BLX;
					f.color=Color.hashHexToNum(_fData[filter].C);
					f.knockout=_fData[filter].KK;
					f.outerStrength=_fData[filter].IN?0:_fData[filter].STR;
					f.innerStrength=_fData[filter].IN?_fData[filter].STR:0;
					currfilter.push(f);
				}else if(filter=="DSF"){//drop shadow
					let f=<PIXI.filters.DropShadowFilter>(MCEffect.getFilter(obj,'DropShadowFilter'));
					f.alpha=_fData[filter].STR;
					f.blur=_fData[filter].BLX/4; 
					f.color=Color.hashHexToNum(_fData[filter].C);
					f.rotation=_fData[filter].AL; 
					f.shadowOnly=_fData[filter].HO; 
					f.distance=_fData[filter].DST; 
					f.quality=_fData[filter].Q*3;
					currfilter.push(f);
				}else if(filter=="BF"){//Bevel
					let f=<PIXI.filters.BevelFilter>(MCEffect.getFilter(obj,'BevelFilter'));
					f.rotation=_fData[filter].AL; 
					f.thickness=_fData[filter].DST; 
					f.lightColor=Color.hashHexToNum(_fData[filter].HC);
					f.lightAlpha=_fData[filter].HA;
					f.shadowColor=Color.hashHexToNum(_fData[filter].SC); 
					f.shadowAlpha=_fData[filter].SA;
					currfilter.push(f);
				}else if(filter=="ACF"){//adjust color
					let f=<PIXI.filters.AdjustmentFilter>(MCEffect.getFilter(obj,'AdjustmentFilter'));
					f.brightness=MCEffect.to05(_fData[filter].BRT);
					f.contrast=MCEffect.to05(_fData[filter].CT);
					f.saturation=MCEffect.to05(_fData[filter].SAT);
					currfilter.push(f);
					//* hue
				}
			}
		}
		obj.filters=currfilter;
	}
	
	static getFilter(obj:MCDisplayObject,_key:string,_option?:any):PIXI.Filter{
		if(obj.filtercache[_key]){
			
			return obj.filtercache[_key];
		}
		if(_key=="ColorMatrixFilter" || _key=="BlurFilter"){
			obj.filtercache[_key]=new PIXI.filters[_key]()
		}
		if(_key=="DropShadowFilter" || _key=="GlowFilter" || _key=="BevelFilter" || _key=="AdjustmentFilter"){
			obj.filtercache[_key]=new PIXI.filters[_key](_option)
		}
		return obj.filtercache[_key];
	}

	static to05(_num:int):float{
		if(_num<0){
			return 1+_num/100
		}else if(_num>0){
			return 1+400/_num
		}
		return 1
	}
}