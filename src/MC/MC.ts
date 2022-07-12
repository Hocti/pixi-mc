import {Matrix,Point} from '@pixi/math';
import { Container,IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';

import MCSymbolModel from './MCSymbolModel';
import MCTimeline from './MCTimeline';
import MCPlayer from './MCPlayer';
import {ColorMatrixAction,MCEffect,EffectGroup,EffectGroupAction} from './MCEffect';
import ASI from './ASI';
import {MCType,childData, LoopState,layerData,rawInstenceData, rawAsiData} from './MCStructure';
import * as TMath from '../utils/TMath';
import MCDisplayObject from './MCDisplayObject';
import {BLEND_MODES} from '@pixi/constants';
import { getTimer } from '../utils/utils';
import MCSprite from './MCSprite';


type MCOption={
	player?:MCPlayer
}

export default class MC extends MCDisplayObject {

	//for debug
	public static totalMC:uint=0;
	public static REMOVEMC:uint=0;
	public static countChildren(s:Sprite):uint{
		let t=s.children.length;
		for(let l of s.children){
			t+=MC.countChildren(<Sprite>l)
		}
		return t
	}
	
	public static MAX_SAME:uint=100;

	protected _symbolModel:MCSymbolModel;
	protected _timeline:MCTimeline;
	protected _player:MCPlayer;

	public get timeline():MCTimeline{
		return this._timeline
	}
	
	public get symbolModel():MCSymbolModel{
		return this._symbolModel
	}

	public get player():MCPlayer{
		return this._player
	}

	private _type:MCType=MCType.MovieClip;
	//public trPoint:Point=new Point();

	public removePasted:boolean=false;//remove children who not display on currentFrame

	private maskList:Dictionary<Container>={};
	private asiMaskList:Dictionary<ASI>={};
	private currShowing:uint=0;
	protected mcChildren:Dictionary<MCDisplayObject>={};
	protected mcChildrenUsed:Dictionary<boolean>={};
	
	//graphic
	public firstFrame:uint=1;
	public loop:LoopState=LoopState.Loop;
	public graphic_start:uint=0;

	//movieclip
	public stopAtEnd:boolean=false;
	
	public isScene:boolean=false;


	constructor(model:MCSymbolModel,option?:MCOption) {
		super();
		
		this._symbolModel=model;

		this._player=(option?.player)?option.player:MCPlayer.getInstance();
		this._timeline=this.initTimeline()
		
		this.on('added',this.onAdded)
		
		this.blendMode=model.defaultBlendMode;
		this.stopAtEnd=model.defaultStopAtEnd;
		this.baseEffect.visible=model.defaultVisible;
		this._player.addMC(this);


		//for debug
		++MC.totalMC;
	}

	protected initTimeline():MCTimeline{
		return new MCTimeline(this);
	}

	protected onAdded(_parent:Container){
		this._timeline.onMCAdded();
		this.showEffect();
	}
    

	public stopAll():void{
		this.timeline.stop();
		for(let ch of this.children){
			if(ch instanceof MC){
				ch.stopAll();
			}
		}
	}

	/*
	public searchChildBySymbolName(_name:string){
		for(const c of this.children){
			if(c instanceof MC){
				if((<MC>c).symbolModel.name===_name){
					return c;
				}
			}
		}
	}
	*/
	
	protected destroyOption={
		children:true,texture:false
	}

	public destroy(options?: IDestroyOptions | boolean){
		for(const k in this.asiMaskList){
			this.asiMaskList[k].destroy(this.destroyOption)
		}
		for(const k in this.maskList){
			this.maskList[k].destroy(this.destroyOption)
		}
		for(const k in this.mcChildren){
			this.mcChildren[k].destroy(this.destroyOption)
		}
		super.destroy(options)
	}

	public set type(_type:MCType){
		if(this._type!=_type){
			this._type=_type;
			if(_type===MCType.Button){
				this.buttonMode=true;
				this.interactive = true;
			}else{
				this.buttonMode=false;  
			}
		}
	}

	public get type():MCType{
		return this._type
	}

	public layerEffects:Dictionary<EffectGroup>={};

	public showFrame(frame:uint):void{
		
		//change effect
		frame=TMath.clamp(frame,1,this.timeline.totalFrames)
		if(this.effectChanged){
			this.effectChanged=false;
			this.showEffect();
		}

		//only update contain when frame changed
		if(this.currShowing === frame && !this.effectChanged)return;
		this.currShowing= frame;

		const currFrameData=this.symbolModel.getFrame(frame);
		
		if(this.symbolModel.visibleRemarks[frame]!==undefined){
			this.baseEffect.visible=this.symbolModel.visibleRemarks[frame];
			if(this.baseEffect.visible){
				this.showEffect();
			}else{
				return
			}
		}

		for(const k in this.mcChildrenUsed){
			this.mcChildrenUsed[k]=false;
		}
		
		let ly!:layerData;
		let ch:MCDisplayObject;
		let z:uint=0;

		let setMaskList:{child:MCDisplayObject,mask:string}[]=[];
		for(let c of currFrameData.child){
			ly=currFrameData.layer[c.layer];
			ch=this.showChild(c,frame)
			if(c.type===MCType.Graphic){
				(<MC>ch).graphic_start=0;//c.firstframe-frame;
				
			}
			ch.zIndex=++z;
			ch.visible=true;
			if(!ch.parent){
				this.addChild(ch)
			}

			//get mask info
			if(ly.isMask){
				if(ch instanceof ASI){
					this.asiMaskList[ly.name]=<ASI>ch
				}
				this.getMask(ly.name,ch.zIndex).addChild(ch);
			}else{

				//set Raw timeline Color/Filter
				if(ly.C || ly.F){
					//console.log(ly.C,ly.F,"layer",c)
					MCEffect.setRawColorAndFilter(ch,ly.C,ly.F,"rawLayer_")
				}

				//layer effect
				if(this.layerEffects[ly.name]){
					ch.addEffect(this.layerEffects[ly.name],'layerEffect')
					//ch.extraEffects['layerEffect']=;
				}else if(ch.extraEffects['layerEffect']){
					ch.removeEffect('layerEffect')
					//delete ch.extraEffects['layerEffect'];
				}

				ch.showEffect();

				//mask by object
				if(ly.maskBy){
					setMaskList.push({child:ch,mask:ly.maskBy});
				}
			} 
		}

		//set mask
		for(let m of setMaskList){
			if(m.child instanceof ASI && this.asiMaskList[m.mask]){
				m.child.mask=this.asiMaskList[m.mask]
			}else{
				m.child.mask=this.maskList[m.mask];
			}
		}

		//diplay / remove
		for(const k in this.mcChildrenUsed){
			//this.mcChildren[k].visible=this.mcChildrenUsed[k]
			if(!this.mcChildrenUsed[k]){
				if(this.mcChildren[k].parent===this){
					this.removeChild(this.mcChildren[k])
				}
				this.mcChildren[k].visible=false;
			}
			if(this.mcChildren[k] instanceof MC){
				(<MC>this.mcChildren[k]).timeline.active=this.mcChildrenUsed[k];
			}
		}
		this.sortChildren()

		if(this.removePasted){
			for(const k in this.mcChildrenUsed){//remove unuse
				if(!this.mcChildrenUsed[k] && this.mcChildren[k]){
					//(<Sprite>(this.mcChildren[k])).destroy({children:true});//*
					this.removeChild(this.mcChildren[k])
					delete this.mcChildren[k]
					delete this.mcChildrenUsed[k]
					MC.REMOVEMC++;
				}
			}
		}


	}

	protected getMask(_name:string,_z:uint):Container{
		if(!this.maskList[_name]){
			this.maskList[_name]=new Container();
			this.maskList[_name].name='mask_'+_name;
			this.addChildAt(this.maskList[_name],_z);
		}
		return this.maskList[_name];
	}

	protected showChild(obj:childData,frame:uint):MCDisplayObject{
		const m2d:Matrix=TMath.m3dto2d(obj.data!.M3D);
		
		//console.log((<rawInstenceData>obj.data).IN,TMath.m2dDetail(m2d))

		const isMC:boolean=(<rawInstenceData>obj.data).SN !== undefined;
		let [name,child,m2d2]=this.showChildInner(obj.data!,isMC,obj.layer);

			(<MC>child).temp_matrix.m2d=m2d;
			(<MC>child).temp_matrix.m2d2=m2d2;
		
		
		child.transform.setFromMatrix(m2d.append(m2d2));

		if(this.blendMode!==BLEND_MODES.NORMAL){
			(<Sprite>child).blendMode=this.blendMode;
		}
		
		this.mcChildrenUsed[name]=true;
		if(!this.mcChildren[name]){
			this.mcChildren[name]=child;
			this.addChild(child);
		}
		//child.visible=true;
		return child;
	}

	protected showChildInner(data:rawInstenceData | rawAsiData,isMC:boolean,layerNum:uint):[string,MCDisplayObject,Matrix]{
		if(isMC){
			return this.showMC(data! as rawInstenceData,layerNum);
		}else{
			return this.showASI(data! as rawAsiData,layerNum);
		}
	}

	protected showMC(obj:rawInstenceData,layerNum:uint):[string,MCDisplayObject,Matrix]{
		let newmatrix=new Matrix();
		let name:string=this.getUniName(`L${layerNum}|${obj.SN}|${obj.IN}|${obj.ST}`);
		let mc=<MCDisplayObject>this.search(name);
		let isSprite=this.symbolModel.mcModel.symbolList[obj.SN].isSprite;
		if(!mc){
			if(isSprite){
				mc=this.symbolModel.mcModel.symbolList[obj.SN].makeInstance()//*isSprite
			}else{
				mc=new MC(this.symbolModel.mcModel.symbolList[obj.SN],{player:this.player});
				(<MC>mc).type=obj.ST;
			}
			mc.name=obj.IN;
		}
		//newmatrix.translate(obj.TRP.x,obj.TRP.y)

		(<MC>mc).temp_matrix.TRP=obj.TRP;
		//console.log(this.pivot)

		if(isSprite){//set asi matrix
			//newmatrix=newmatrix.append(this.symbolModel.mcModel.symbolList[obj.SN].spriteMatrix!).append((<ASI>mc).model.matrix);
		}else if(mc instanceof MC){//Graphic Frame
			if(mc.type===MCType.Graphic){
				if(obj.FF!=undefined){
					mc.firstFrame=Number(obj.FF)+1;
				}
				if(obj.LP){
					mc.loop=obj.LP;
				}
			}
		}


		MCEffect.setRawColorAndFilter(mc,obj.C,obj.F,"timeline_");

		return [name,mc,newmatrix]
	}

	protected showASI(obj:rawAsiData,layerNum:uint):[string,ASI,Matrix]{
		const partname:string=obj.N;

		const part=this.symbolModel.mcModel.partList[partname];
		
		//set asi matrix
		let newmatrix=part.matrix;

		let name:string=this.getUniName(`L${layerNum}|${partname}`);//*skin
		let child:ASI=<ASI>this.search(name)
		if(!child){
			child=new ASI(part);
			child.name=name;
		}
		return [name,child,newmatrix]
	}

	protected getUniName(name:string):string{
		let num=1;
		let newname='';
		if(!this.mcChildrenUsed[name]){
			return name;
		}else{
			do{
				newname=`${name}-${++num}`;
				if(num>MC.MAX_SAME){
					console.error('name all fail',newname,name)
					return newname;
				}
			}while(this.mcChildrenUsed[newname]);
		}
		return newname;
	}

	protected search(name:string):MCDisplayObject | undefined{
		if(this.mcChildrenUsed[name]===false && this.mcChildren[name]){
			return this.mcChildren[name];
		}
		return undefined;
	}
}

/*

SKIN Object:
load base
load json
load img in json
check if meta.json
	replace?
	color?
*/