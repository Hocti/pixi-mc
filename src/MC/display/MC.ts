import {Matrix,Point} from '@pixi/math';
import { Container,IDestroyOptions } from '@pixi/display';
import { Sprite } from '@pixi/sprite';

import MCSymbolModel from '../model/MCSymbolModel';
import MCTimeline from '../player/MCTimeline';
import MCPlayer from '../player/MCPlayer';
import {ColorMatrixAction,MCEffect,EffectGroup,EffectGroupAction} from '../effect';
import ASI from './ASI';
import {MCType,childData, LoopState,layerData,rawInstenceData, rawAsiData, frameData} from '../model/MCStructure';
import * as TMath from '../../utils/TMath';
import MCDisplayObject from './MCDisplayObject';
import {BLEND_MODES} from '@pixi/constants';
import MCSprite from './MCSprite';
import IMCSprite from './IMCSprite';


export type MCOption={
	player?:MCPlayer
}

export default class MC extends MCDisplayObject implements IMCSprite{

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
	public path():string{
		let trees:string[]=[this.name];
		let con:Container=this.parent;
		while(con instanceof MC){
			trees.push(con.name)
			con=con.parent
			if(!con)break;
		}
		return trees.reverse().join('.');
	}

	//=================
	
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

	protected maskList:Dictionary<Container>={};
	protected asiMaskList:Dictionary<ASI>={};
	protected currShowingFrame:uint=0;
	protected mcChildren:Dictionary<MCDisplayObject>={};
	protected mcChildrenUsed:Dictionary<boolean>={};
	
	//graphic
	public firstFrame:uint=1;
	public loop:LoopState=LoopState.Loop;
	public graphic_start:uint=0;

	//movieclip
	public stopAtEnd:boolean=false;
	
	public isScene:boolean=false;

	//inital and destory


	constructor(symbolModel:MCSymbolModel,option?:MCOption) {
		super();
		//set status from model
		this._symbolModel=symbolModel;
		this.stopAtEnd=symbolModel.defaultStopAtEnd;

		if(symbolModel.defaultBlendMode!==BLEND_MODES.NORMAL || !symbolModel.defaultVisible){
			this.baseEffect.blendMode=this.blendMode=symbolModel.defaultBlendMode;
			this.baseEffect.visible=symbolModel.defaultVisible;
			this.effectChanged=true;
		}

		//player,timeline
		this._player=(option?.player)?option.player:MCPlayer.getInstance();
		this._player.addMC(this);
		this._timeline=this.initTimeline()
		//
		this.on('added',this.onAdded)

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

	//MC type

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

	//method

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

	//show frame

	protected needRedraw:boolean=false;

	public showFrame(frame:uint):void{
		this.showEffect();
		
		//only update contain when frame changed
		frame=TMath.clamp(frame,1,this.timeline.totalFrames)
		if(this.needRedraw){
			this.needRedraw=false;
		}else if(this.currShowingFrame === frame)return;
		this.currShowingFrame = frame;
		

		const currFrameData:frameData=this.symbolModel.getFrame(this.currShowingFrame);

		/*TODO:half frame
			this.showFrameByData(currFrameData,frame);
		}
		
		protected showFrameByData(currFrameData:frameData,frame:uint):void{
		*/

		if(this.symbolModel.visibleRemarks[frame]!==undefined && this.baseEffect.visible!==this.symbolModel.visibleRemarks[frame]){
			this.baseEffect.visible=this.symbolModel.visibleRemarks[frame];
			this.effectChanged=true;
			if(!this.baseEffect.visible){
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
			ch=this.showChild(c,ly);
			ch.zIndex=++z;
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

	protected showChild(obj:childData,ly:layerData):MCDisplayObject{
		const m2d:Matrix=TMath.m3dto2d(obj.data!.M3D);
		
		//console.log((<rawInstenceData>obj.data).IN,TMath.m2dDetail(m2d))

		let name:string,child:MCDisplayObject,m2d2:Matrix;
		const isMC:boolean=(<rawInstenceData>obj.data).SN !== undefined;
		if(isMC){
			const dat:rawInstenceData=obj.data! as rawInstenceData

			[name,child,m2d2]=this.showMC(dat,ly);

			//Graphic Frame
			if(child instanceof MC && child.type===MCType.Graphic){
				if(dat.FF!=undefined){
					child.firstFrame=Number(dat.FF)+1;
				}
				if(dat.LP){
					child.loop=dat.LP;
				}
				(<MC>child).graphic_start=0;//c.firstframe-frame;
			}
			MCEffect.setRawColorAndFilter(child,dat.C,dat.F,"timeline_");
			//console.log(child,dat.C,dat.F)
		}else{
			[name,child,m2d2]=this.showASI(obj.data! as rawAsiData,ly);
		}


		//(<MC>child).temp_matrix.m2d=m2d;
		//(<MC>child).temp_matrix.m2d2=m2d2;
		
		
		child.transform.setFromMatrix(m2d.append(m2d2));

		if(this.baseEffect.blendMode!==BLEND_MODES.NORMAL && child.baseEffect.blendMode!==this.baseEffect.blendMode){
			child.baseEffect.blendMode=this.baseEffect.blendMode;
			child.effectChanged=true;
		}
		
		this.mcChildrenUsed[name]=true;
		if(!this.mcChildren[name] || this.mcChildren[name]!==child){
			this.mcChildren[name]=child;
			this.addChild(child);
		}
		//child.visible=true;
		return child;
	}

	protected showMC(data:rawInstenceData,ly:layerData):[string,MCDisplayObject,Matrix]{
		let name:string=this.getUniName(`L${ly.num}|${data.SN}|${data.IN}|${data.ST}`);
		let child:IMCSprite=<IMCSprite>this.search(name);

		if(!child){
			let currSymbolModel:MCSymbolModel=this.symbolModel.mcModel.symbolList[data.SN];
			child=this.createFromSymbol(currSymbolModel,data);
		}

		return [name,child,child.symbolModel.defaultMatrix||new Matrix()]
	}
	
	protected createFromSymbol(currSymbolModel:MCSymbolModel,data:rawInstenceData):IMCSprite{
		let mc:IMCSprite
		if(currSymbolModel.isMCSprite){
			mc=new MCSprite(currSymbolModel);
		}else{
			mc=new (<any>this.constructor)(currSymbolModel,{player:this.player});
			(<MC>mc).type=data.ST;
		}
		if(data.IN!==''){
			mc.name=data.IN;
		}
		return mc
	}

	protected showASI(obj:rawAsiData,ld:layerData):[string,ASI,Matrix]{
		const partname:string=obj.N;

		const part=this.symbolModel.mcModel.partList[partname];
		
		//set asi matrix
		let newmatrix=part.matrix;

		let name:string=this.getUniName(`L${ld.num}|${partname}`);//*skin
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