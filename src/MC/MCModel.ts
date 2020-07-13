///<reference path="../type_alias.d.ts"/>
import {AsiModel} from './MCStructure';
import MCSymbolModel from './MCSymbolModel';
import MC from './MC';
import ASI from './ASI';
import MCScene from './MCScene';
import MCLibrary from './MCLibrary';
import MCDisplayObject from './MCDisplayObject';

export default class MCModel{

	public mainSymbolModel:MCSymbolModel;
	public symbolList:Dictionary<MCSymbolModel>={};
	public partList:Dictionary<AsiModel>={};
	public basepath:string;

	public fps:number;
	public sceneList:string[]=[];
	public withScene:boolean=false;
	protected _name:string;

	constructor(animation:any,spritemaps:any[],basepath:string) {
		this.fps=Number(animation.MD.FRT);
		this._name=<string>animation.AN.N;

		this.partList=MCModel.processSpritemap(spritemaps,basepath)

		this.mainSymbolModel=this.processAnimationData(animation.AN,true)
		if(animation.SD){
			for(let v of animation.SD.S){
				this.processAnimationData(v)
			}
		}
		this.basepath=basepath;
		if(this.mainSymbolModel.totalFrames==1){
			this.withScene=true;
			for(let c of this.mainSymbolModel.getFrame(1).child){
				if(c.data.IN.substr(0,5)=='scene'){
					this.sceneList[Number(c.data.IN.substr(5))]=c.data.SN;
				}else{
					this.withScene=false;
				}
			}
			if(!this.withScene){
				this.sceneList=[];
			}
		}
		MCLibrary.getInstance().push(this,basepath)
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

	public processAnimationData(data:any,isMAster:boolean=false):MCSymbolModel{
		let syb=new MCSymbolModel(data,this,isMAster);
		this.symbolList[syb.name]=syb
		return syb;
	}

	public static processSpritemap(spritemap:any,basepath:string=''){
		let partList:{ [id: string] : AsiModel }={}
		for(let v of spritemap){
			for(let s of v.ATLAS.SPRITES){
				let part:AsiModel={
					rect:new PIXI.Rectangle(s.SPRITE.x,s.SPRITE.y,s.SPRITE.w,s.SPRITE.h),
					image:basepath+v.meta.image,
					rotated:s.SPRITE.rotated,
					zoom:v.meta.resolution
				}
				ASI.makeTexture(part)
				partList[s.SPRITE.name]=part;
			}
		}
		return partList;
	}

	get name():string{
		return this._name;
	}

}