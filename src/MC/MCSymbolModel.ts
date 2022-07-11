import {Matrix,Rectangle} from '@pixi/math';
import {Texture,BufferResource} from '@pixi/core'
import {BLEND_MODES} from '@pixi/constants';
import {hashHexToUint8} from '../utils/color';

import MC from './MC';
import {
	childData,frameData,rawAsiData,symbolModelData,layerData,
	FrameLabels, AsiModel,SoundType,m3d,GeomRemark,
	PlayRemark,SoundRemark,ExtraRemark,ScriptRemark
} from './MCStructure';//action,
import MCModel from './MCModel';
import {MCType} from './MCType';
import ASI from './ASI';
import * as TMath from '../utils/TMath';
import MCDisplayObject from './MCDisplayObject';

export default class MCSymbolModel {

	public mcModel:MCModel;
	protected _name:string='';
	protected _data:symbolModelData;

	protected _layerNameList:string[]=[];
	protected _LabelList:FrameLabels={};
	protected _totalFrame:uint=1;
	private _isMaster:boolean=false;

	constructor(data:symbolModelData,_model:MCModel,isMaster:boolean=false) {
		this.mcModel=_model
		this._data=data;
		this._name=data.SN;
		this._isMaster=isMaster;

		if(data.SN.substring(0,14)=='remark/remark_')return

		let totalFrame=1;
		let asiCount=0;
		let mcCount=0;
		let remarkCount=0;
		let firstAsi:rawAsiData | undefined;
		let maxtimeslot=1;

		//loop all layer
		for(const k in data.TL.L){
			let timeslot=0

			this._layerNameList.push(data.TL.L[k].LN);

			//loop all frame on each layer
			for(const f of data.TL.L[k].FR){
				timeslot++
				maxtimeslot=Math.max(timeslot,maxtimeslot)

				//label name
				if(f.N){
					this._LabelList[<string>f.N]=f.I+1;
				}

				totalFrame=Math.max(totalFrame,f.I+f.DU);

				//loop all element on 1 layer,1 frame
				for(const e of f.E){
					//find remark
					if(e.SI && e.SI.SN.substring(0,14)=='remark/remark_'){
						let type:string=e.SI.SN.substring(14);
						this.processRemark(type,String(e.SI.IN).split('$'),f.I+1,f.I+f.DU);
						remarkCount++;
					}else if(e.SI && e.SI.SN.substring(0,12)=='remark/geom_'){
						let type:string=e.SI.SN.substring(12);
						this.processGeomRemark(type,String(e.SI.IN).split('$'),f.I+1,f.I+f.DU,TMath.m3dto2d(e.SI.M3D));
						remarkCount++;
					}else if(e.SI){
						mcCount++
					}else if(e.ASI){
						if(asiCount==0){
							firstAsi=e.ASI
						}
						asiCount++;
					}
				}
			}
		}
		this._totalFrame=totalFrame;
		
		//if is Special ASI
		if(firstAsi){
			

			//change to solid color box asi
			if(data.SN.substring(0,14)=='solidcolorbox_'){
				const colorHexStr=data.SN.substring(14)
				const texture=Texture.fromBuffer(hashHexToUint8(colorHexStr),1,1);

				this.specialAsiModel=<AsiModel>{
					rect:new Rectangle(0,0,1,1),
					image:'solid',
					rotated:false,
					zoom:1,
					texture,
					matrix:new Matrix()
				};
				this.specialAsimatrix=new Matrix();
				this.specialAsimatrix.d=this.mcModel.partList[firstAsi.N].rect.width
				this.specialAsimatrix.a=this.mcModel.partList[firstAsi.N].rect.height
				this._isSpecialASI=true;
				return
			}

			if(asiCount==1 && mcCount==0 && maxtimeslot==1){

				this._isSpecialASI=true;
				this.specialAsiModel=this.mcModel.partList[firstAsi.N];
				this.specialAsimatrix=TMath.m3dto2d(firstAsi.M3D);
			}
		}
	}

	//remarks

	public soundRemark:SoundRemark[][]=[];
	public playRemark:PlayRemark[]=[];
	public visibleRemarks:boolean[]=[];
	public scriptRemarks:Dictionary<ScriptRemark>={};
	public defaultBlendMode:BLEND_MODES=BLEND_MODES.NORMAL;
	public defaultStopAtEnd:boolean=false;
	public defaultVisible:boolean=true;

	public extraRemark:Dictionary<ExtraRemark[]>={};

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
		}else if(type=='hideAtStart'){
			this.defaultVisible=false;
		}else if(type=='hideHere'){
			this.visibleRemarks[frame_begin]=false;
		}else if(type=='showHere'){
			this.visibleRemarks[frame_begin]=true;
		}else{
			if(!this.extraRemark[type]){
				this.extraRemark[type]=[]; 
			}
			this.extraRemark[type].push({type,frame_begin,frame_end,args:args});
		}
	}

	
	public geomRemarks:GeomRemark[]=[];
	private processGeomRemark(type:string,args:string[],frame_begin:uint,frame_end:uint,m2d:Matrix){
		const detail=TMath.m2dDetail(m2d);
		const gr:GeomRemark={type,frame_begin,frame_end,args:args,
			x:detail.x,
			y:detail.y
		}
		if(type==="rect"){
			gr.w=detail.scaleX*100;
			gr.h=detail.scaleY*100;
		}else if(type==="circle"){
			gr.w=detail.scaleX*50;
			gr.h=detail.scaleY*50;
		}else if(type==="line"){
			gr.w=detail.scaleX*100;
			gr.rotate=detail.rotation;
		}else if(type==="point"){
			gr.rotate=detail.rotation;
		}
		this.geomRemarks.push(gr)
	}

	//frame=============================

	private frameDataCache:frameData[]=[]
	private layerDataCache:layerData[]=[]
	private childDataCache:Dictionary<childData>={};

	public getFrame(frame:uint):frameData{
		if(this.frameDataCache[frame]){
			return this.frameDataCache[frame];
		}
		let FrameData:frameData={child:[],layer:[]};
		//let FrameData:frameData={child:[],sound:[],script:[],timeline:[],layer:[]};
		let minFrame:uint=0;
		for(let layer_num:uint=this._data.TL.L.length-1;layer_num>=0;layer_num--){
			let layer_name=<string>this._data.TL.L[layer_num].LN;
			if(layer_name.substring(7)=='remark_'){
				//* remark special layer
				continue
			}
			if(!this.layerDataCache[layer_num]){
				this.layerDataCache[layer_num]={
					name:layer_name,
					isMask:(this._data.TL.L[layer_num].LT==='Clp'),
					maskBy:this._data.TL.L[layer_num].Clpb
				}
			}
			//Clp=mask,Clpb=mask Layer name
			let timeslot=0;
			for(const f of this._data.TL.L[layer_num].FR){
				timeslot++;
				if(frame>=f.I && frame <=f.I+f.DU ){

					minFrame=Math.max(minFrame,f.I)
					const firstframe=f.I;

					for(let ei:uint=0,et:uint=f.E.length;ei<et;ei++){
						if(f.E[ei].SI && f.E[ei].SI!.SN.substring(0,7)=='remark/'){
							continue;
						}
						const cacheKey=`${layer_num}.${f.I}.${ei}`;
						if(this.childDataCache[cacheKey]){
							FrameData.child.push(this.childDataCache[cacheKey])
							continue;
						}
						let childData:childData={data:undefined,type:MCType.ASI,firstframe,layer:layer_num,timeslot};
						if(f.E[ei].SI){
							childData.data=f.E[ei].SI
							childData.type=f.E[ei].SI!.ST
						}else if(f.E[ei].ASI){
							childData.data=f.E[ei].ASI
						}else{
							continue;
						}
						if(f.DU>1){
							this.childDataCache[cacheKey]=childData;
						}
						FrameData.child.push(childData);
					}
					if(!f.C && !f.F){
						FrameData.layer[layer_num]=this.layerDataCache[layer_num];
					}else{
						if(f.C && !this.layerDataCache[layer_num].C){//} && !this.layerDataCache[layer_num].F){
							this.layerDataCache[layer_num].C=f.C;
						}
						if(f.F && !this.layerDataCache[layer_num].F){
							this.layerDataCache[layer_num].F=f.F;
						}
						FrameData.layer[layer_num]=<layerData>{
							...this.layerDataCache[layer_num],
							F:f.F,
							C:f.C
						};

					}
					break;
				}
			}
		}

		//cache
		minFrame++;
		if(!this.frameDataCache[minFrame]){
			this.frameDataCache[minFrame]=FrameData
		}
		this.frameDataCache[frame]=this.frameDataCache[minFrame];

		return FrameData;
	}

	//special Asi===========================
	//all child just contain one asi
	 private _isSpecialASI:boolean=false;
	 private specialAsiModel?:AsiModel;
	 public specialAsimatrix?:Matrix;
	 public get isSpecialASI():boolean{
		return this._isSpecialASI;
	}

	//instance=============================

	public makeInstance():MCDisplayObject{
		if(this.isSpecialASI){
			return new ASI(this.specialAsiModel!,this.name,true);
		}
		return new MC(this);
	}

	//read only=============================

	public get isMaster():boolean{
		return this._isMaster;
	}

	public get name():string{
		return this._name;
	}

	public get LabelList():FrameLabels{
		return this._LabelList;
	}

	public get layerNameList():string[]{
		return this._layerNameList;
	}

	public get totalFrames():uint{
		return this._totalFrame;
	}
    
    public containLabel(_label:string):boolean
    {
        return this.LabelList[_label]!==undefined;
    }
}
