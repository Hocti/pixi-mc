import {EventEmitter} from 'pixi.js';
import MCActor from "./MCActor";
import MCPlayer from "../MC/player/MCPlayer";
import {Ticker} from "pixi.js";

export type ActorStep={
    action:string,
    phase?:string,
    from?:number,
    to?:number,
    time:number,
}

export default class MCActorPlayer extends EventEmitter{

    protected actor:MCActor;
    protected loop:boolean=false;
    protected playing:boolean=false;

    protected storedSteps:ActorStep[]=[];
    protected currentStep:ActorStep | undefined;
    protected currentPassedTime:number=0;


    constructor(actor:MCActor){
        super();
        this.actor=actor;

        MCPlayer.ticker.add(this.update.bind(this))
    }

    public play(playSteps:ActorStep[],loop:boolean=false){
        this.storedSteps=playSteps
        this.playing=true;
        this.loop=loop;
        this.nextStep();
    }

    public stop(){
        this.storedSteps=[];
        this.currentStep=undefined;
        this.playing=false;
        this.currentPassedTime=0;
    }

    public pause(){
        this.playing=false;
    }

    public continue(){
        this.playing=true;
    }

    protected update(ticker: Ticker):void{
        const delta:number=ticker.deltaTime; //number
        //delta:number

        if(!this.playing){
            return;
        }
        if(!this.currentStep){
            return;
        }

        if(!this.currentStep.from)this.currentStep.from=0;
        if(!this.currentStep.to)this.currentStep.to=1;
        const progess=Math.min(1,this.currentStep.from + this.currentPassedTime/this.currentStep.time * (this.currentStep.to-this.currentStep.from));
        
        this.actor.showAction(this.currentStep.action,this.currentStep.phase,progess);
        
        if(progess===1){
            if(this.storedSteps.length>0 || this.loop){
                this.nextStep()
            }else{
                this.stop();
                this.emit('finish');
            }
        }
        this.currentPassedTime+=delta/MCPlayer.ticker.FPS;
    }

    protected nextStep(){
        this.currentStep=this.storedSteps.shift();
        if(this.loop){
            this.storedSteps.push(this.currentStep!);
        }
        this.currentPassedTime=0;
    }

}