import {Matrix,Point} from "@pixi/math"
import { Container } from '@pixi/display';
import { Sprite } from "@pixi/sprite";

import MCSymbolModel from './MCSymbolModel';
import MCTimeline from './MCTimeline';
import {LoopState} from './Timeline';
import MCPlayer from './MCPlayer';
import {ColorMatrixAction,MCEffect} from './MCEffect';
import ASI from './ASI';
import {childData, AsiModel,layerData} from './MCStructure';
import {MCType} from './MCType';
import * as TMath from '../utils/TMath';
import MCDisplayObject from './MCDisplayObject';



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

	//*public get only
	public symbolModel:MCSymbolModel;
	public _timeline:MCTimeline;
	public player:MCPlayer;

	private _type:MCType=MCType.MovieClip;
	//public trPoint:Point=new Point();

	public removePasted:boolean=false;
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

	constructor(model:MCSymbolModel,_player:MCPlayer=MCPlayer.getInstance()) {
		super();
		
		this.symbolModel=model;
		this._timeline=new MCTimeline(this);
		
		this.player=_player;
		this.player.addMC(this);

		this.blendMode=model.defaultBlendMode;
		this.stopAtEnd=model.defaultStopAtEnd;

		this.on('added',(_mc)=>{
			this.showFrame(1)
		})
		
		//for debug
		++MC.totalMC;
	}

	/*
	public loadSkin(_path:string){
		//*
	}
	*/

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
				if((<MC>c).symbolModel.name==_name){
					return c;
				}
			}
		}
	}
	*/

	get timeline():MCTimeline{
		return this._timeline;
	}

	public destroy(_option:any=null){
		for(const k in this.asiMaskList){
			this.asiMaskList[k].destroy(this.destroyOption)
		}
		for(const k in this.maskList){
			this.maskList[k].destroy(this.destroyOption)
		}
		for(const k in this.mcChildren){
			this.mcChildren[k].destroy(this.destroyOption)
		}
		super.destroy(_option)
	}

	public set type(_type:MCType){
		if(this._type!=_type){
			this._type=_type;
			if(_type==MCType.Button){
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

	public showFrame(frame:uint):void{
		if(!this.visible || this.alpha===0)return;
		frame=TMath.clamp(frame,1,this.timeline.totalFrames)
		if(this.currShowing == frame)return;
		this.currShowing= frame

		for(const k in this.mcChildrenUsed){
			this.mcChildrenUsed[k]=false;
		}

		const currFrameData=this.symbolModel.getFrame(frame);
		/*
		if(this.timeline.totalFrames==1 && currFrameData.child.length==1){
			console.log('should br ASI!',this.symbolModel.name)
		}
		*/
		let ly!:layerData;
		let ch:MCDisplayObject;
		let z:uint=0;

		let setMaskList:{child:MCDisplayObject,mask:string}[]=[];
		for(let c of currFrameData.child){
			ly=currFrameData.layer[c.layer];
			ch=this.showChild(c,frame)
			if(c.type==MCType.Graphic){
				(<MC>ch).graphic_start=0;//c.firstframe-frame;
				
			}
			ch.zIndex=++z;
			ch.visible=true;
			if(!ch.parent){
				this.addChild(ch)
			}
			
			if(ly.name=='outline'){
				MCEffect.setColorMatcix(ch,ColorMatrixAction.brightness(1))
				//ch.tint=0x0000ff
			}
			if(ly.name=='color'){
				ch.tint=0xffcc00
			}
			if(ly.name=='effect'){
				(<any>window).topch=ch
				MCEffect.setColorMatcix(ch,ColorMatrixAction.tint('ffff00',1))

				//MCEffect.setColorMatcix(ch,ColorMatrixAction.hue(90))
				//MCEffect.setColorMatcix(ch,ColorMatrixAction.saturation(-50))
				//MCEffect.setColorMatcix(ch,ColorMatrixAction.contrast(-100))
			}
			
			// C=Color, F=Filter
			if(ly.C || ly.F){
				MCEffect.setEffect(ly.C,ly.F,ch)
			}
			//get mask info
			if(ly.isMask){
				if(ch instanceof ASI){
					this.asiMaskList[ly.name]=<ASI>ch
				}
				this.getMask(ly.name,ch.zIndex).addChild(ch);
			}else if(ly.maskBy){
				setMaskList.push({child:ch,mask:ly.maskBy});
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
				if(this.mcChildren[k].parent==this){
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
		const m2d:Matrix=TMath.m3dto2d(obj.data.M3D)
		let name:string='';
		let layerNum=obj.layer;
		let child:MCDisplayObject;
		let m2d2:Matrix;
		if(obj.data.SN){
			[name,child,m2d2]=this.showMC(obj.data,layerNum);
			//child.transform.setFromMatrix(m2d)
		}else{
			[name,child,m2d2]=this.showSprite(obj.data,layerNum);
		}
		if(this.blendMode!=0){
			(<Sprite>child).blendMode=this.blendMode
		}
		
		child.transform.setFromMatrix(m2d.append(m2d2))
		this.mcChildrenUsed[name]=true;
		if(!this.mcChildren[name]){
			this.mcChildren[name]=child;
			this.addChild(child);
		}
		child.visible=true;
		return child;
	}

	protected showMC(obj:any,layerNum:uint):[string,MCDisplayObject,Matrix]{
		let newmatrix=new Matrix();
		let name:string=this.getUniName(`L${layerNum}|${obj.SN}|${obj.IN}|${obj.ST}`);
		let mc=<MCDisplayObject>this.search(name)
		let isASI=this.symbolModel.mcModel.symbolList[obj.SN].isSpecialASI;
		if(!mc){
			if(isASI){
				mc=this.symbolModel.mcModel.symbolList[obj.SN].makeASI()//*isSpecialASI
			}else{
				mc=new MC(this.symbolModel.mcModel.symbolList[obj.SN],this.player);
				(<MC>mc).type=obj.ST;
			}
			mc.name=obj.IN;
		}
		if(isASI){//set asi matrix
			newmatrix=newmatrix.append(this.symbolModel.mcModel.symbolList[obj.SN].specialAsimatrix!).append((<ASI>mc).model.matrix)
		}else if(mc instanceof MC){//Graphic Frame
			if(mc.type==MCType.Graphic){
				if(obj.FF!=undefined){
					mc.firstFrame=Number(obj.FF)+1
				}
				if(obj.LP){
					mc.loop=obj.LP
				}
			}
		}

		/*
		replacement by empty container
		if(mc skin changed && change mc exsit){
			
		}
		*/

		//filter
		MCEffect.setEffect(obj.C,obj.F,mc)

		return [name,mc,newmatrix]
	}

	protected showSprite(obj:any,layerNum:uint):[string,ASI,Matrix]{
		const partname:string=obj.N

		const part=this.symbolModel.mcModel.partList[partname];
		/*re skin
		if(mc skin changed && change part exsit){
			part=new skin part
			matrix chanage
		}
		//*clear unsed skin?
		*/
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
		let newname=''
		if(!this.mcChildrenUsed[name]){
			return name
		}else{
			do{
				newname=`${name}-${++num}`
				if(num>MC.MAX_SAME){
					console.error('name all fail',newname,name)
					return newname;
					break
				}
			}while(this.mcChildrenUsed[newname])
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

/*extend MC+MC to long mc
instance/library flyweight


combine MC



SKIN Object:
load base
load json
load img in json
check if meta.json
	replace?
	color?
*/