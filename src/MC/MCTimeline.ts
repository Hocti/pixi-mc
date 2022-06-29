import {MCType} from './MCType';
import {timelineEventType} from './MCEvent';
import {FrameLabels,LoopState, SoundType,SoundRemark} from './MCStructure';
import MCScene from './MCScene';
import MC from './MC';
import {playStatus,playDirection} from './Timeline';
import Timeline from './Timeline';
import MCSound from './MCSound';
import * as TMath from '../utils/TMath';
import { Container } from '@pixi/display';

export default class MCTimeline extends Timeline{
	//public get only
	public mc:MC;

	public _halfFrame:boolean=false;
	protected _speed:float=1;
	protected _direction=playDirection.obverse;
	protected _currentFrameFloat:float=0;
	
	constructor(_mc:MC) {
		super();
		this.mc=_mc;
	}

	public onMCAdded(){
		this.mc.showFrame(1)
	}

	public onFrameChange(_oldFrame:uint=1){
		this.remarkSound(this._currentFrame)
		if(this.mc.type==MCType.MovieClip){
			this.remarkPlay(this._currentFrame)
			this.remarkScript(this._currentFrame)
		}
		this.emit(timelineEventType.frameChange,{mc:this.mc,oldFrame:_oldFrame,newFrame:this.currentFrame});
	}

	private scriptList:Function[][]=[];

	private getFrame(_target:uint|string):uint{
		if(typeof(_target)  === "string"){
			if(this.labels[_target]){
				return this.labels[_target]
			}
			if(this.mc.symbolModel.scriptRemarks[_target]){
				return this.mc.symbolModel.scriptRemarks[_target].frame
			}else{
				console.error('cannot get frame:',_target,this.mc.symbolModel.scriptRemarks)
			}
		}
		return <uint>_target;
	}
	public addScript(_target:uint|string,_fn:Function):void{
		let frame:uint=this.getFrame(_target);
		if(!this.scriptList[frame]){
			this.scriptList[frame]=[];
		}
		this.scriptList[frame].push(_fn)
	}
	public clearScript(_target:uint):void{
		this.scriptList[this.getFrame(_target)]=[];
	}
	private remarkScript(_f:uint):void{
		if(this.scriptList[_f]){
			for(const fn of this.scriptList[_f]){
				fn.call(this.mc);
			}
		}
	}



	private remarkPlay(_f:uint):void{
		if(this.mc.symbolModel.playRemark[_f]){
			let type:string=this.mc.symbolModel.playRemark[_f].type;
			if(type=='play'){
				this.play();
			}else if(type=='stop'){
				this.stop();
			}else{
				let frame=<uint | string>this.mc.symbolModel.playRemark[_f].frame;
				if(type=='gotoAndPlay'){
					this.gotoAndPlay(frame)
				}else if(type=='gotoAndStop'){
					this.gotoAndStop(frame)
				}else if(type=='goto'){
					this.goto(frame)
				}
			}
		}
	}

	private remarkSound(_f:uint):void{
		if(this.mc.symbolModel.soundRemark[_f]){
			for(let s of this.mc.symbolModel.soundRemark[_f]){
				if(s.type===SoundType.stopAllSound){
					MCSound.stopAllSound();
					return;
				}
				MCSound.play(s,this.mc.symbolModel.mcModel.basepath);//s.type,(<string[]>s.content)[0],(<string[]>s.content)[1],this.mc.symbolModel.mcModel.basepath);
			}
		}
	}




	public processMC(){
		if(this._playStatus==playStatus.playing){
			this._currentFrameFloat+=this._speed*this._direction;
			let intFrame=Math.ceil(this._currentFrameFloat);
			if(this.mc.isScene){
				//console.log(this.totalFrames,intFrame,this._currentFrameFloat,this.mc.stopAtEnd)
			}
			if(intFrame>this.totalFrames){
				if(this.mc.stopAtEnd){//stopAtEnd
					intFrame=this._currentFrameFloat=this.totalFrames;
					this._playStatus=playStatus.stop;
				}else if(this.mc.isScene){//next scene
					(this.mc.parent as MCScene).nextScene();
				}else{//loop
					this._currentFrameFloat=this._currentFrameFloat%this.totalFrames
				}
			}
			/*rewind
			else if(intFrame<1){
				if(this._direction>0){
					intFrame=this._currentFrameFloat=1;
				}else if(this._direction<0){
					intFrame=this._currentFrameFloat=this.totalFrames;
				}
			}
			*/
			intFrame=TMath.clamp(Math.round(this._currentFrameFloat),1,this.totalFrames)
			if(intFrame!=this._currentFrame){//confirm change frame
				let old_frame=this._currentFrame;
				this._currentFrame=intFrame;
				this.onFrameChange(old_frame)
				//*bug? when speed more then 1, will skip script/sound?
			}
		}
	}

	public processB(){
		this._playStatus=playStatus.stop
		this.goto(1)//*who cares button?
	}
	
	public processG(){
		/*if(this.loop=LoopState.Stop){
			this._currentFrame=this.mc.firstFrame;
		}else if(this.loop=LoopState.Loop){
			this._currentFrame=(this.mc.firstFrame+this.mc.graphic_start)%this.totalFrames;
		}else if(this.loop=LoopState.Once){
			this._currentFrame=Math.min(this.mc.firstFrame+this.mc.graphic_start,this.totalFrames);
		}*/
		if(this._currentFrame!=this.mc.firstFrame){
			let old_frame=this._currentFrame;
			this._currentFrame=this.mc.firstFrame;
			this.onFrameChange(old_frame)
		}
	}

	get speed():float{
		return this._speed;
	}

	set speed(_n:float){
		this._speed=TMath.clamp(Math.abs(_n),0.01,32)
	}

	//override

	protected processTick():void{
		//need change to state?
		if(this.mc.type==MCType.MovieClip){
			this.processMC()
		}else if(this.mc.type==MCType.Graphic){
			this.processG()
		}else if(this.mc.type==MCType.Button){
			this.processB()
		}else{
			super.processTick();
		}
	}

	protected setCurrentFrame(_frame:uint):void{
		let old_frame=this.currentFrame;
		super.setCurrentFrame(_frame)
		if(this.currentFrame!=old_frame){
			this.onFrameChange(old_frame)
		}
		this._currentFrameFloat=this.currentFrame-0.9999;
	}

	get labels():FrameLabels{
		return this.mc.symbolModel.LabelList;
	}

	get totalFrames():uint{
		return this.mc.symbolModel.totalFrames;
	}
}