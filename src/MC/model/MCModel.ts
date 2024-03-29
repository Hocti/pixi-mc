import {Matrix,Rectangle} from 'pixi.js';

import {AsiModel,spriteData,symbolModelData,fullmodelData,rawInstenceData} from './MCStructure';
import MCSymbolModel from './MCSymbolModel';
import MC from '../display/MC';
import ASI from '../display/ASI';
import MCScene from '../display/MCScene';
import MCDisplayObject from '../display/MCDisplayObject';
import MCLibrary from './MCLibrary';

export default class MCModel{

	/*publicReadonly*/ public mainSymbolModel:MCSymbolModel;
	/*publicReadonly*/ public symbolList:Record<string,MCSymbolModel>={};
	/*publicReadonly*/ public partList:Record<string,AsiModel>={};
	/*publicReadonly*/ public basepath:string;
	/*publicReadonly*/ public fps:number;
	/*publicReadonly*/ public sceneList:string[]=[];
	/*publicReadonly*/ public withScene:boolean=false;
	/*publicReadonly*/ public name:string;

	public static preloadAllTexture:boolean=true;

	constructor(animation:fullmodelData,spritemaps:spriteData[],basepath:string) {
		this.fps=Number(animation.MD.FRT);
		this.name=<string>animation.AN.N!;

		this.partList=MCModel.processSpritemap(spritemaps,basepath)
		if(MCModel.preloadAllTexture){
			this.preloadTexture();
		}

		this.mainSymbolModel=this.processAnimationData(animation.AN)
		if(animation.SD){
			for(let v of animation.SD.S){
				this.processAnimationData(v)
			}
		}
		this.basepath=basepath;
		if(this.mainSymbolModel.totalFrames===1){
			this.withScene=true;
			for(let c of this.mainSymbolModel.getFrame(1).child){
				const inName:string=(<rawInstenceData>c.data!).IN;
				const snName:string=(<rawInstenceData>c.data!).SN;
				if(inName && inName.substring(0,5)==='scene'){
					this.sceneList[Number(inName.substring(5))]=snName;
				}else{
					this.withScene=false;
				}
			}
			if(!this.withScene){
				this.sceneList=[];
			}
		}
		MCLibrary.push(this,basepath)
	}

	public preloadTexture(){
		for(let partName in this.partList){
			ASI.makeTexture(this.partList[partName])
		}
	}

	public makeInstance(_symbolname?:string):MCDisplayObject{
		if(this.withScene){
			return new MCScene(this.mainSymbolModel);
		}
		if(_symbolname && this.symbolList[_symbolname]){
			return new MC(this.symbolList[_symbolname]);
		}
		return new MC(this.mainSymbolModel);
	}

	private processAnimationData(data:symbolModelData):MCSymbolModel{
		let syb=new MCSymbolModel(data,this);
		this.symbolList[syb.name]=syb
		return syb;
	}

	private static processSpritemap(spritemap:spriteData[],basepath:string=''){
		let partList:Record<string,AsiModel>={}
		for(let v of spritemap){
			for(let s of v.ATLAS.SPRITES){
				let part:AsiModel={
					rect:new Rectangle(s.SPRITE.x,s.SPRITE.y,s.SPRITE.w,s.SPRITE.h),
					image:basepath+v.meta.image,
					rotated:s.SPRITE.rotated,
					zoom:parseFloat(v.meta.resolution),
					matrix:new Matrix()
				}
				if(part.rotated){
					part.matrix.a=part.rect.height/part.rect.width;
					part.matrix.d=part.rect.width/part.rect.height;
				}
				partList[s.SPRITE.name]=part;
			}
		}
		return partList;
	}

}