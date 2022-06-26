import MC from '../MC';
import {MCType} from '../MCType';
import MCTimeline from '../MCTimeline';
import MCSymbolModel from '../MCSymbolModel';
import MCPlayer from '../MCPlayer';
import Timeline,{playStatus,playDirection} from '../Timeline';
import {playTarget} from '../MCStructure';
import * as TMath from '../../utils/TMath';


export class LabelTimeline extends MCTimeline{

    protected targetLabel?:string;
    protected targetFrame:uint;
    protected playFinish:boolean;
    protected doneCall?:Function;

    constructor(_mc:LabelMC){
        super(_mc)
        this.targetFrame=0;
        this.playFinish=true;
    }

	protected processTick():void{
		if(this._playStatus==playStatus.playing){

            const oldFrame:uint=this._currentFrame;

            this._direction=this._currentFrame<this.targetFrame?1:-1;

			this._currentFrameFloat+=this._speed*this._direction;
			let intFrame=Math.ceil(this._currentFrameFloat);

            //loop
			if(intFrame>this.totalFrames){
				this._currentFrameFloat=this._currentFrameFloat%this.totalFrames
			}else if(intFrame<0){
                this._currentFrameFloat=this.totalFrames
            }
            
			intFrame=TMath.clamp(Math.round(this._currentFrameFloat),1,this.totalFrames)

            if(
                (oldFrame>this.targetFrame && intFrame<this.targetFrame && this._direction<0) ||
                (oldFrame<this.targetFrame && intFrame>this.targetFrame && this._direction>0)
            ){
                intFrame=this.targetFrame
            }

			if(intFrame!=this._currentFrame){//confirm change frame
				this._currentFrame=intFrame;
				this.onFrameChange(oldFrame)
			}

            if(intFrame===this.targetFrame){
                this.playDone();
            }
		}
	}

    //=============

	public goto(_target:playTarget){
        console.log('goto',_target)
        super.goto(_target);
        this.setTarget(_target)
	}

    private setTarget(_target:playTarget):void{
        if(typeof _target ==='number'){
            this.targetFrame=_target;
            this.targetLabel=this.getLabel(_target);
        }else{
            if(this.mc.containLabel(_target)){
                this.targetLabel=_target;
                this.targetFrame=this.labels[_target];
            }
        }
        this.playFinish=true;
        this.doneCall=undefined;
    }

    public playTo(_target:playTarget,_doneCall?:Function):void 
    {
        this.setTarget(_target)
        this.doneCall=_doneCall;
        if(this.currentFrame!==this.targetFrame){
            this.playFinish=false;
            this._playStatus=playStatus.playing;
        }else{
            this.playDone();
        }
    }

    public fromTo(_from:playTarget,_target:playTarget,_doneCall?:Function):void 
    {
        this.goto(_from);
        this.playTo(_target,_doneCall);
    }

    private playDone():void 
    {
        if(this.doneCall){
            this.doneCall.call(this,this);
        }
        this.cancel();
    }

    public cancel():void 
    {
        this.playFinish = true;
        this._playStatus=playStatus.stop;
        this.doneCall=undefined;
    }

    public pause():void 
    {
        this._playStatus=playStatus.stop;
    }

    public resume():void 
    {
        if(this._playStatus==playStatus.stop && !this.playFinish){
            this._playStatus=playStatus.playing;
        }
    }

}

export default class LabelMC extends MC{
    
	constructor(model:MCSymbolModel, _startLabel:string = "",_player:MCPlayer=MCPlayer.getInstance()) {
		super(model,_player);
        //console.log(this.containLabel(_startLabel),_startLabel)
        if(this.containLabel(_startLabel)){
            this.timeline.gotoAndStop(_startLabel)
        }
        this.type=MCType.MovieClip
	}

	protected initTimeline():MCTimeline{
		this.on('added',(_mc)=>{
            //console.log('added label')
		})
		return new LabelTimeline(this);
	}
}