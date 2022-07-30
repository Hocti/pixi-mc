import {Matrix,Rectangle} from '@pixi/math';
import {Texture,BufferResource} from '@pixi/core'
import {BLEND_MODES} from '@pixi/constants';


import MC from '../display/MC';
import MCSprite from '../display/MCSprite';
import {hashHexToUint8} from '../../utils/color';

import {MCType,
	childData,frameData,rawAsiData,symbolModelData,layerData,
	 AsiModel,SoundType,m3d,GeomRemark,
	PlayRemark,SoundRemark,ExtraRemark,ScriptRemark
} from './MCStructure';//action,
import {type FrameLabels} from '../player/Timeline';
import MCModel from './MCModel';
import ASI from '../display/ASI';
import MCDisplayObject from '../display/MCDisplayObject';
import IMCSprite from '../display/IMCSprite';

import * as TMath from '../../utils/TMath';

export default class MCSymbolModel {

	private _data:symbolModelData;

	public mcModel:MCModel;
	public name:string='';
	public layerNameList:string[]=[];
	public LabelList:FrameLabels={};
	public totalFrames:uint=1;
	public isMaster:boolean=false;

	constructor(data:symbolModelData,_model:MCModel) {

		this.mcModel=_model
		this._data=data;
		this.name=data.SN;
		this.isMaster=data.N!==undefined;

		if(data.SN.substring(0,14)==='remark/remark_')return

		let totalFrames=1;
		let asiCount=0;
		let mcCount=0;
		let remarkCount=0;
		let firstAsi:rawAsiData | undefined;
		let maxtimeslot=1;

		//loop all layer
		for(const k in data.TL.L){
			let timeslot=0

			this.layerNameList.push(data.TL.L[k].LN);

			//loop all frame on each layer
			for(const f of data.TL.L[k].FR){
				timeslot++
				maxtimeslot=Math.max(timeslot,maxtimeslot)

				//label name
				if(f.N){
					this.LabelList[f.N]=f.I+1;
				}

				totalFrames=Math.max(totalFrames,f.I+f.DU);

				//loop all element on 1 layer,1 frame
				for(const e of f.E){
					//find remark
					if(e.SI && e.SI.SN.substring(0,14)==='remark/remark_'){
						let type:string=e.SI.SN.substring(14);
						this.processRemark(type,e.SI.IN===''?[]:String(e.SI.IN).split('$'),f.I+1,f.I+f.DU,f.N);
						remarkCount++;
					}else if(e.SI && e.SI.SN.substring(0,12)==='remark/geom_'){
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
		this.totalFrames=totalFrames;
		
		//if is Special ASI
		if(firstAsi){
			

			//change to solid color box asi
			if(data.SN.substring(0,14)==='solidcolorbox_'){
				const colorHexStr=data.SN.substring(14)
				const texture=Texture.fromBuffer(hashHexToUint8(colorHexStr),16,16);

				this.spriteModel=<AsiModel>{
					rect:new Rectangle(0,0,16,16),
					image:'solid',
					rotated:false,
					zoom:1,
					texture,
					matrix:new Matrix()
				};
				const m=new Matrix();
				m.d=this.mcModel.partList[firstAsi.N].rect.width;
				m.a=this.mcModel.partList[firstAsi.N].rect.height;

				this.spriteMatrix=m;
				this.isMCSprite=true;
				return
			}

			if(asiCount===1 && mcCount===0 && maxtimeslot===1){

				this.isMCSprite=true;
				this.spriteModel=this.mcModel.partList[firstAsi.N];
				this.spriteMatrix=TMath.m3dto2d(firstAsi.M3D);
			}
		}
	}

	//remarks
	public soundRemarks:SoundRemark[][]=[];
	public playRemarks:PlayRemark[]=[];
	public visibleRemarks:boolean[]=[];
	public scriptRemarks:Record<string,ScriptRemark>={};
	public geomRemarks:GeomRemark[]=[];
	public extraRemarks:Record<string,ExtraRemark[]>={};

	//default status
	public defaultBlendMode:BLEND_MODES=BLEND_MODES.NORMAL;
	public defaultStopAtEnd:boolean=false;
	public defaultVisible:boolean=true;
	public defaultMatrix?:Matrix;


	private processRemark(type:string,args:string[],frame_begin:uint,frame_end:uint,frame_label?:string){
		if(type==="sound" || type==="stopAllSound"){
			if(!this.soundRemarks[frame_begin]){
				this.soundRemarks[frame_begin]=[]
			}
			this.soundRemarks[frame_begin].push({type:args[0] as SoundType,soundFile:args[1]});
		}else if(type==='play' || type==='stop'){
			this.playRemarks[frame_begin]={type};
		}else if(type==='gotoAndPlay' || type==='gotoAndStop' || type==='jump'){
			if(parseInt(args[1])>0){
				this.playRemarks[frame_begin]={type,frame:parseInt(args[1]),frameNumber:parseInt(args[1])};
			}else{
				this.playRemarks[frame_begin]={type,frame:args[1],frameLabel:args[1]};
			}
		}else if(type==='script'){
			const scriptName=args.shift();
			this.scriptRemarks[scriptName!]={frame:frame_begin,args:args};
		}else if(type==='blendMode'){
			const bName:string=(args[0].toUpperCase());
			
			if(bName in BLEND_MODES){
				this.defaultBlendMode=Object.values(BLEND_MODES).indexOf(bName)
				//console.log(2,type,args,this.defaultBlendMode)
				//BLEND_MODES[bName]
			}
		}else if(type==='stopAtEnd'){
			this.defaultStopAtEnd=true;
		}else if(type==='hideAtStart'){
			this.defaultVisible=false;
		}else if(type==='hideHere'){
			this.visibleRemarks[frame_begin]=false;
		}else if(type==='showHere'){
			this.visibleRemarks[frame_begin]=true;
		}else{
			if(!this.extraRemarks[type]){
				this.extraRemarks[type]=[]; 
			}
			this.extraRemarks[type].push({type,frame_begin,frame_end,args:args,frame_label});
		}
	}

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
	private childDataCache:Record<string,childData>={};

	public getFrame(frame:uint):frameData{
		if(this.frameDataCache[frame]){
			return this.frameDataCache[frame];
		}
		let FrameData:frameData={child:[],layer:[]};
		//let FrameData:frameData={child:[],sound:[],script:[],timeline:[],layer:[]};
		let minFrame:uint=0;
		for(let layer_num:uint=this._data.TL.L.length-1;layer_num>=0;layer_num--){
			let layer_name=<string>this._data.TL.L[layer_num].LN;
			if(layer_name.substring(7)==='remark_'){
				//* remark special layer
				continue
			}
			if(!this.layerDataCache[layer_num]){
				this.layerDataCache[layer_num]={
					num:layer_num,
					name:layer_name,
					isMask:(this._data.TL.L[layer_num].LT==='Clp'),
					maskBy:this._data.TL.L[layer_num].Clpb,
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
						if(f.E[ei].SI && f.E[ei].SI!.SN.substring(0,7)==='remark/'){
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

	//sprite===========================
	//all child just contain one asi

	public isMCSprite:boolean=false;
	public spriteMatrix?:Matrix;
	
	public spriteModel?:AsiModel;

	//instance=============================

	public makeInstance():IMCSprite{
		if(this.isMCSprite){
			return new MCSprite(this);
		}
		return new MC(this);
	}

	//read only=============================
    
    public containLabel(_label:string):boolean
    {
        return this.LabelList[_label]!==undefined;
    }
}
