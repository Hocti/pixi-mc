///
import {action,remark,childData,frameData,FrameLabels} from './MCStructure';
import MCModel from './MCModel';
import {MCType} from './MCType';
import ASI from './ASI';
import {AsiModel,scriptRemark} from './MCStructure';
import * as TMath from '../utils/TMath';
import TSound from '../utils/TSound';

export default class MCSymbolModel {

	public mcModel:MCModel;
	protected _name:string='';
	protected _data:any;

	protected LayerNameList:string[]=[];
	protected _LabelList:FrameLabels={};
	protected _totalFrame:uint=1;
	
	private _isMaster:boolean=false;

	constructor(data:any,mc:MCModel,isMaster:boolean=false) {
		this.mcModel=mc
		this._data=data;
		this._name=data.SN;
		this._isMaster=isMaster;

		if(data.SN.substr(0,14)=='remark/remark_')return

		let totalFrame=1;
		let phaseMarker:string[]=[]
		let asiCount=0;
		let mcCount=0;
		let remarkCount=0;
		let onlyAsi:any;
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
					if(e.SI && e.SI.SN.substr(0,14)=='remark/remark_'){
						let type:string=e.SI.SN.substr(14);
						if(type.substr(0,5)=='phase'){
							phaseMarker[f.I]=e.SI.IN==""?type.substr(6):e.SI.IN;
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
		
		//change to solid color box asi
		if(data.SN.substr(0,14)=='solidcolorbox_'){
			let canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			let ctx = canvas.getContext("2d")!;
			ctx.fillStyle = "#"+data.SN.substr(14);
			ctx.fillRect(0, 0, 1, 1);
			this.specialAsiModel=<AsiModel>{
				rect:new PIXI.Rectangle(0,0,1,1),
				image:'solid',
				rotated:false,
				zoom:1,
				texture:PIXI.Texture.from(canvas),
				matrix:new PIXI.Matrix()
			};
			this.specialAsimatrix=new PIXI.Matrix();
			this._isSpecialASI=true;
			this.specialAsimatrix=new PIXI.Matrix();
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

		//process phase inn action
		if(phaseMarker.length>0){
			for(let k in this.actionList){
				let phasenum=0;
				for(let i=this.actionList[k].begin;i<=this.actionList[k].end;i++){
					if(phaseMarker[i]){
						const phasename=phaseMarker[i]=='auto'?`p${++phasenum}`:phaseMarker[i];
						this.actionList[k].phase[phasename]=i
					}
				}
			}
			console.log(this.actionList)
			//*process actions
		}
	}

	public soundRemark:remark[][]=[];
	public playRemark:remark[]=[];
	public scriptRemarks:Dictionary<scriptRemark>={};
	public actionList:Dictionary<action>={};

	public defaultBlendMode:uint=0;//PIXI.BLEND_MODES.NORMAL
	public defaultStopAtEnd:boolean=false;

	 static readonly BLENDLIST=('NORMAL,ADD,MULTIPLY,SCREEN,OVERLAY,DARKEN,LIGHTEN,COLOR_DODGE,COLOR_BURN,HARD_LIGHT,SOFT_LIGHT,DIFFERENCE,EXCLUSION,HUE,SATURATION,COLOR,LUMINOSITY,NORMAL_NPM,ADD_NPM,SCREEN_NPM,NONE,SRC_IN,SRC_OUT,SRC_ATOP,DST_OVER,DST_IN,DST_OUT,DST_ATOP,SUBTRACT,SRC_OVER,ERASE,XOR').split(',');


	 private _isSpecialASI:boolean=false;
	 private specialAsiModel?:AsiModel;
	 public specialAsimatrix?:PIXI.Matrix;
	 public makeASI():ASI{
		 let a=new ASI(this.specialAsiModel!,this.name);
		 //a.blendMode=this.defaultBlendMode;
		return a;
	}

	 public get isSpecialASI():boolean{
		return this._isSpecialASI;
	}

	private processRemark(type:string,args:string[],frame_begin:uint,frame_end:uint){
		if(type=='sound' || type=='stopAllSound'){
			if(!this.soundRemark[frame_begin]){
				this.soundRemark[frame_begin]=[]
			}
			this.soundRemark[frame_begin].push({type,content:args});
		}else if(type=='play' || type=='stop'){
			this.playRemark[frame_begin]={type};
		}else if(type=='gotoAndPlay' || type=='gotoAndStop' || type=='jump'){
			this.playRemark[frame_begin]={type,content:args};
		}else if(type=='script'){
			let name=args.shift();
			this.scriptRemarks[name!]={frame:frame_begin,args:args};
		}else if(type=='blendMode'){
			this.defaultBlendMode=MCSymbolModel.BLENDLIST.indexOf(args[0].toUpperCase());
		}else if(type=='stopAtEnd'){
			this.defaultStopAtEnd=true;
		}else if(type=='action'){
			this.actionList[args[0]]={
				name:args[0],
				begin:frame_begin,
				end:frame_end,
				phase:{}
			}
		}
	}

	private frameDataCache:frameData[]=[]
	private childDataCache:any=[];

	public getFrame(frame:uint):frameData{
		if(this.frameDataCache[frame]){
			return this.frameDataCache[frame];
		}
		let FrameData:frameData={child:[],sound:[],script:[],timeline:[],layer:[]};

		for(let layer_num:uint=this._data.TL.L.length-1;layer_num>=0;layer_num--){
			let layer_name=<string>this._data.TL.L[layer_num].LN;
			if(layer_name.substr(7)=='remark_'){
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
						if(e.SI && e.SI.SN.substr(0,8)=='_remark/'){
							continue;
						}

						let childData:childData={data:null,type:MCType.ASI,firstframe,layer:layer_num,timeslot};
						//*cache too...
						if(e.SI){
							if(e.SI.SN.substr(0,7)=='remark/'){
								/*run remark
								if(firstframe==frame){
									const type=e.SI.SN.substr(7)
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
						
						//MCEffect.setEffect(e.C,e.F,dpo)
						//*layer color change
					}
					if(layer_name.substr(0,7)=='remark_'){
						continue;
					}
					FrameData.layer[layer_num]={
						name:layer_name,
						C:f.C,
						F:f.F,
						isMask:this._data.TL.L[layer_num].LT && this._data.TL.L[layer_num].LT=='Clp',
						maskBy:this._data.TL.L[layer_num].Clpb
					};

					break;
				}
			}
		}
		this.frameDataCache[frame]=FrameData;
		return FrameData;
	}

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