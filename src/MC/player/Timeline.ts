import {EventEmitter} from '@pixi/utils';//eventemitter3

import {LoopState,playTarget} from '../model/MCStructure';
import * as TMath from '../../utils/TMath';

export enum timelineEventType{
	complete = 'complete',
	loop = 'loop',

	frameChange = 'frameChange',
	enterframe = 'enterframe',
	exitframe = 'exitframe',
	sceneChange = 'sceneChange'

    /*
	actionComplete = 'actionComplete',
	actionCancel = 'actionCancel',
	labelComplete = 'labelComplete',
	labelCancel = 'labelCancel',
    */
}

export type FrameLabels=Record<string,uint>;

export enum playStatus{
	playing,
	stop
}

export enum playDirection{
	obverse=1,
	reverse=-1
}

export default class Timeline extends EventEmitter{

	protected _currentFrame:uint=1;
	protected _playStatus:playStatus=playStatus.playing
	protected _active:boolean=true;

	protected _labels:FrameLabels;
	protected _totalFrames:uint;

	constructor(_totalFrames:uint=1,_labels:FrameLabels={}) {
		super();
		this._labels=_labels;
		this._totalFrames=_totalFrames;
	}

	public processFrame(_framepass:uint=1){
		for(let f=0;f<_framepass;f++){
			this.emit(timelineEventType.enterframe,{type:timelineEventType.enterframe,target:this});
		}
		if(this.totalFrames>1){
			for(let f=0;f<_framepass;f++){
				this.processTick();
			}
		}
		for(let f=0;f<_framepass;f++){
			this.emit(timelineEventType.exitframe,{type:timelineEventType.exitframe,target:this});
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

	public getLabelFromFrame(_frame:uint):string | undefined{
		for(let k in this.labels){
			if(this.labels[k]===_frame){
				return k;
			}
		}
		return undefined;
	}

	get currentLabel():string | undefined{
		return this.getLabelFromFrame(this._currentFrame);
	}

	get labels():FrameLabels{
		return this._labels;
	}

	get totalFrames():uint{
		return this._totalFrames;
	}

	get currentFrame():uint{
		return this._currentFrame;
	}

	get isPlaying():boolean{
		return this._playStatus===playStatus.playing;
	}

	protected setCurrentFrame(_frame:uint):void{
		this._currentFrame=TMath.clamp(_frame,1,this.totalFrames)
	}

	public goto(target:playTarget){
		if(Number(target)>0){
			this.setCurrentFrame(Number(target));
		}else{
			if(this.labels[<string>target])
				this.setCurrentFrame(this.labels[<string>target]);
		}
	}

	public gotoAndPlay(target:playTarget){
		this.goto(target)
		this.play()
	}

	public gotoAndStop(target:playTarget){
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