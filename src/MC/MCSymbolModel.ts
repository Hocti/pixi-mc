import {Matrix,Rectangle} from '@pixi/math';
import {Texture} from '@pixi/core'
import {BLEND_MODES} from '@pixi/constants';

import {childData,frameData,FrameLabels, PlayRemark,SoundRemark,SoundType} from './MCStructure';//action,
import MCModel from './MCModel';
import {MCType} from './MCType';
import ASI from './ASI';
import {AsiModel,ScriptRemark,rawAsiData,symbolModelData} from './MCStructure';
import * as TMath from '../utils/TMath';

export default class MCSymbolModel {

	public mcModel:MCModel;
	protected _name:string='';
	protected _data:symbolModelData;

	protected LayerNameList:string[]=[];
	protected _LabelList:FrameLabels={};
	protected _totalFrame:uint=1;
	
	private _isMaster:boolean=false;

	constructor(data:symbolModelData,mc:MCModel,isMaster:boolean=false) {
		this.mcModel=mc
		this._data=data;
		this._name=data.SN;
		this._isMaster=isMaster;

		if(data.SN.substring(0,14)=='remark/remark_')return

		let totalFrame=1;
		let keyMarker:string[]=[]
		let asiCount=0;
		let mcCount=0;
		let remarkCount=0;
		let onlyAsi:rawAsiData | undefined;
		let maxtimeslot=1;
		for(const k in data.TL.L){
			let timeslot=0
			for(const f of data.TL.L[k].FR){
				timeslot++
				maxtimeslot=Math.max(timeslot,maxtimeslot)
				if(f.N){
					this._LabelList[<string>f.N]=f.I+1;
				}
				totalFrame=Math.max(totalFrame,f.I+f.DU);
				for(const e of f.E){
					//if(e.SI && e.SI.SN)console.log(e.SI.SN)
					if(e.SI && e.SI.SN.substring(0,14)=='remark/remark_'){
						let type:string=e.SI.SN.substring(14);
						if(type.substring(0,5)=='key'){
							keyMarker[f.I]=e.SI.IN==""?type.substring(6):e.SI.IN;
							continue;
						}
						this.processRemark(type,String(e.SI.IN).split('$'),f.I+1,f.I+f.DU);
						remarkCount++;
					}else if(e.SI){
						mcCount++
					}else if(e.ASI){
						if(asiCount==0){
							onlyAsi=e.ASI
						}
						asiCount++;
					}
				}
			}
		}
		this._totalFrame=totalFrame;
		
		if(onlyAsi){
			//change to solid color box asi
			if(data.SN.substring(0,14)=='solidcolorbox_'){
				let canvas = document.createElement('canvas');
				canvas.width = 1;
				canvas.height = 1;
				let ctx = canvas.getContext("2d")!;
				ctx.fillStyle = "#"+data.SN.substring(14);
				ctx.fillRect(0, 0, 1, 1);
				this.specialAsiModel=<AsiModel>{
					rect:new Rectangle(0,0,1,1),
					image:'solid',
					rotated:false,
					zoom:1,
					texture:Texture.from(canvas),
					matrix:new Matrix()
				};
				this.specialAsimatrix=new Matrix();
				this._isSpecialASI=true;
				this.specialAsimatrix=new Matrix();
				this.specialAsimatrix.d=this.mcModel.partList[onlyAsi.N].rect.width
				this.specialAsimatrix.a=this.mcModel.partList[onlyAsi.N].rect.height
				return
			}

			//change to asi
			if(asiCount==1 && mcCount==0 && maxtimeslot==1){
				this._isSpecialASI=true;
				this.specialAsiModel=this.mcModel.partList[onlyAsi.N];
				this.specialAsimatrix=TMath.m3dto2d(onlyAsi.M3D);
				return
			}
		}

		/*
		//process key inn action
		if(keyMarker.length>0){
			for(let k in this.actionList){
				let keynum=0;
				for(let i=this.actionList[k].begin;i<=this.actionList[k].end;i++){
					if(keyMarker[i]){
						const keyname=keyMarker[i]=='auto'?`p${++keynum}`:keyMarker[i];
						this.actionList[k].keys[keyname]=i
					}
				}
			}
			console.log(this.actionList)
			//*process actions
		}
		*/
	}

	public soundRemark:SoundRemark[][]=[];
	public playRemark:PlayRemark[]=[];
	public scriptRemarks:Dictionary<ScriptRemark>={};
	//public actionList:Dictionary<action>={};

	public defaultBlendMode:BLEND_MODES=BLEND_MODES.NORMAL;
	public defaultStopAtEnd:boolean=false;

	//special Asi: all child just contain one asi
	 private _isSpecialASI:boolean=false;
	 private specialAsiModel?:AsiModel;
	 public specialAsimatrix?:Matrix;
	 public makeASI():ASI{
		 //a.blendMode=this.defaultBlendMode;
		return new ASI(this.specialAsiModel!,this.name);
	}

	 public get isSpecialASI():boolean{
		return this._isSpecialASI;
	}

	private processRemark(type:string,args:string[],frame_begin:uint,frame_end:uint){
		if(type==="sound" || type==="stopAllSound"){
			if(!this.soundRemark[frame_begin]){
				this.soundRemark[frame_begin]=[]
			}
			this.soundRemark[frame_begin].push({type:args[0] as SoundType,soundFile:args[1]});
		}else if(type=='play' || type=='stop'){
			this.playRemark[frame_begin]={type};
		}else if(type=='gotoAndPlay' || type=='gotoAndStop' || type=='jump'){
			if(parseInt(args[1])>0){
				this.playRemark[frame_begin]={type,frame:parseInt(args[1]),frameNumber:parseInt(args[1])};
			}else{
				this.playRemark[frame_begin]={type,frame:args[1],frameLabel:args[1]};
			}
		}else if(type=='script'){
			const scriptName=args.shift();
			this.scriptRemarks[scriptName!]={frame:frame_begin,args:args};
		}else if(type=='blendMode'){

			const bName:string=(args[0].toUpperCase());
			
			if(bName in BLEND_MODES){
				this.defaultBlendMode=Object.values(BLEND_MODES).indexOf(bName)
				//BLEND_MODES[bName]
			}
		}else if(type=='stopAtEnd'){
			this.defaultStopAtEnd=true;
		}/*else if(type=='action'){
			this.actionList[args[0]]={
				name:args[0],
				begin:frame_begin,
				end:frame_end,
				keys:{}
			}
		}*/
	}

	private frameDataCache:frameData[]=[]
	//private childDataCache:any=[];

	public getFrame(frame:uint):frameData{
		if(this.frameDataCache[frame]){
			return this.frameDataCache[frame];
		}
		let FrameData:frameData={child:[],layer:[]};
		//let FrameData:frameData={child:[],sound:[],script:[],timeline:[],layer:[]};

		for(let layer_num:uint=this._data.TL.L.length-1;layer_num>=0;layer_num--){
			let layer_name=<string>this._data.TL.L[layer_num].LN;
			if(layer_name.substring(7)=='remark_'){
				//* remark special layer
				continue
			}
			//Clp=mask,Clpb=mask Layer name
			let timeslot=0;
			for(const f of this._data.TL.L[layer_num].FR){
				timeslot++;
				if(frame>=f.I && frame <=f.I+f.DU ){
					const firstframe=f.I;
					for(const e of f.E){
					//for(let en:number=f.E.length-1;en>=0;en--){
						//let e=f.E[en];
						if(e.SI && e.SI.SN.substring(0,8)=='_remark/'){
							continue;
						}

						let childData:childData={data:undefined,type:MCType.ASI,firstframe,layer:layer_num,timeslot};
						//*cache too...
						if(e.SI){
							if(e.SI.SN.substring(0,7)=='remark/'){
								/*run remark
								if(firstframe==frame){
									const type=e.SI.SN.substring(7)
									const args=e.SI.IN.split('|')
								}
								*/
								continue
							}else{
								childData.data=e.SI
								childData.type=e.SI.ST
								FrameData.child.push(childData)
								//dpo=this.showChild(e.SI,layer_num)
							}
						}else if(e.ASI){
							childData.data=e.ASI
							FrameData.child.push(childData)
							//dpo=this.showChild(e.ASI,layer_num)
						}
						
						//MCEffect.setEffect(dpo,e.C,e.F)
						//*layer color change
					}
					if(layer_name.substring(0,7)=='remark_'){
						continue;
					}
					FrameData.layer[layer_num]={
						name:layer_name,
						C:f.C,
						F:f.F,
						isMask:(this._data.TL.L[layer_num].LT==='Clp'),//this._data.TL.L[layer_num].LT && 
						maskBy:this._data.TL.L[layer_num].Clpb
					};

					break;
				}
			}
		}
		this.frameDataCache[frame]=FrameData;
		return FrameData;
	}

	//read

	public get isMaster():boolean{
		return this._isMaster;
	}

	public get name():string{
		return this._name;
	}

	public get LabelList():FrameLabels{
		return this._LabelList;
	}

	public get totalFrames():uint{
		return this._totalFrame;
	}
}