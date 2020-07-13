import {timelineEvent} from './MCEvent';
import {FrameLabels} from './MCStructure';;
import * as TMath from '../utils/TMath';

export enum LoopState{
	Loop='LP',
	Once='PO',
	Stop='SF'
}

export enum playStatus{
	playing,
	stop
}

export enum playDirection{
	obverse=1,
	reverse=-1
}

export default class Timeline extends PIXI.utils.EventEmitter{

	protected _currentFrame:number=1;
	protected _playStatus:playStatus=playStatus.playing
	protected _active:boolean=true;

	protected _labels:FrameLabels;
	protected _totalFrames:number;

	constructor(_totalFrames:number=1,_labels:FrameLabels={}) {
		super();
		this._labels=_labels;
		this._totalFrames=_totalFrames;
	}

	public processFrame(_framepass:number=1){
		for(let f=0;f<_framepass;f++){
			this.emit(timelineEvent.enterframe,{type:timelineEvent.enterframe,target:this});
		}
		if(this.totalFrames>1){
			for(let f=0;f<_framepass;f++){
				this.processTick();
			}
		}
		for(let f=0;f<_framepass;f++){
			this.emit(timelineEvent.exitframe,{type:timelineEvent.exitframe,target:this});
		}
	}

	protected processTick():void{
		if(this.isPlaying){
			let nextF=this._currentFrame+1;
			if(nextF>this.totalFrames){
				//nextF=this.totalFrames
				nextF=1;
			}
			this.setCurrentFrame(nextF);
		}
	}

	get active():boolean{
		return this._active;
	}

	set active(_b:boolean){
		if(!_b){
			this.setCurrentFrame(1)
			this.stop();
		}
		this._active=_b;
	}

	get currentLabel():string | undefined{
		for(let k in this.labels){
			if(this.labels[k]==this._currentFrame){
				return k;
			}
		}
		return undefined;
	}

	get labels():FrameLabels{
		return this._labels;
	}

	get totalFrames():number{
		return this._totalFrames;
	}

	get currentFrame():number{
		return this._currentFrame;
	}

	get isPlaying():boolean{
		return this._playStatus==playStatus.playing;
	}

	protected setCurrentFrame(_frame:number):void{
		this._currentFrame=TMath.clamp(_frame,1,this.totalFrames)
	}

	public goto(target:number | string){
		if(Number(target)>0){
			this.setCurrentFrame(Number(target));
		}else{
			if(this.labels[<string>target])
				this.setCurrentFrame(this.labels[<string>target]);
		}
	}

	public gotoAndPlay(target:number | string){
		this.goto(target)
		this.play()
	}

	public gotoAndStop(target:number | string){
		this.goto(target)
		this.stop()
	}

	public play(){
		this._playStatus=playStatus.playing;
	}

	public stop(){
		this._playStatus=playStatus.stop;
	}

	public nextFrame(){
		this.setCurrentFrame(this._currentFrame+1);
		this.stop()
	}

	public prevFrame(){
		this.setCurrentFrame(this._currentFrame-1);
		this.stop()
	}
}