import {MCType} from './MCType';
import {timelineEvent} from './MCEvent';
import {FrameLabels} from './MCStructure';
import MCScene from './MCScene';
import MC from './MC';
import {playStatus,playDirection,LoopState} from './Timeline';
import Timeline from './Timeline';
import TSound from '../utils/TSound';
import * as TMath from '../utils/TMath';

export default class MCTimeline extends Timeline{
	//public get only
	public mc:MC;

	public _halfFrame:boolean=false;
	protected _speed=1;
	protected _direction=playDirection.obverse;
	protected _currentFrameFloat:number=0;
	
	constructor(_mc:MC) {
		super();
		this.mc=_mc;
	}


	

	public onFrameChange(){
		this.remarkSound(this._currentFrame)
		if(this.mc.type==MCType.MovieClip){
			this.remarkPlay(this._currentFrame)
			this.remarkScript(this._currentFrame)
		}
	}

	

	private scriptList:Function[][]=[];

	private getFrame(_target:number|string):number{
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
		return <number>_target;
	}
	public addScript(_target:number|string,_fn:Function):void{
		let frame:number=this.getFrame(_target);
		if(!this.scriptList[frame]){
			this.scriptList[frame]=[];
		}
		this.scriptList[frame].push(_fn)
	}
	public clearScript(_target:number):void{
		this.scriptList[this.getFrame(_target)]=[];
	}
	private remarkScript(_f:number):void{
		if(this.scriptList[_f]){
			for(const fn of this.scriptList[_f]){
				fn.call(this.mc);
			}
		}
	}



	private remarkPlay(_f:number):void{
		if(this.mc.symbolModel.playRemark[_f]){
			let type:string=this.mc.symbolModel.playRemark[_f].type;
			let content:any=this.mc.symbolModel.playRemark[_f].content;
			if(!content){
				if(type=='play'){
					this.play();
				}else if(type=='stop'){
					this.stop();
				}
			}else{
				if(type=='gotoAndPlay'){
					this.gotoAndPlay(content[1])
				}else if(type=='gotoAndStop'){
					this.gotoAndStop(content[1])
				}else if(type=='goto'){
					this.goto(content[1])
				}
			}
		}
	}

	private remarkSound(_f:number):void{
		if(this.mc.symbolModel.soundRemark[_f]){
			for(let s of this.mc.symbolModel.soundRemark[_f]){
				if(s.type=='stopAllSound'){
					TSound.stopAllSound();
					return;
				}
				TSound.play(s.type,<string[]>s.content,this.mc.symbolModel.mcModel.basepath);
			}
		}
	}




	public processB(){
		this._playStatus=playStatus.stop
		this.goto(1)//*who cares button?
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
				this._currentFrame=intFrame;
				this.onFrameChange()
				//*bug? when speed more then 1, will skip script/sound?
			}
		}
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
			this._currentFrame=this.mc.firstFrame;
			this.onFrameChange()
		}
	}

	get speed():number{
		return this._speed;
	}

	set speed(_n:number){
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

	protected setCurrentFrame(_frame:number):void{
		let old_frame=this.currentFrame;
		super.setCurrentFrame(_frame)
		if(this.currentFrame!=old_frame){
			this.onFrameChange()
		}
		this._currentFrameFloat=this.currentFrame-0.9999;
	}

	get labels():FrameLabels{
		return this.mc.symbolModel.LabelList;
	}

	get totalFrames():number{
		return this.mc.symbolModel.totalFrames;
	}
}