
import { SpriteSheet } from 'pixi.js';
import { AnimatedSprite } from 'pixi.js';
import {MCOption} from './MC';
import MCDisplayObject from './MCDisplayObject';
import type IMCwithTimeline from './IMCwithTimeline';
import Timeline from '../player/Timeline';
import MCPlayer from '../player/MCPlayer';

export default class MCSheet extends MCDisplayObject implements IMCwithTimeline{

    public player:MCPlayer;
    public timeline:Timeline;

    protected totalFrames:uint=1;
    protected aniS:AnimatedSprite;

    constructor(ss:SpriteSheet,option?:MCOption){
        super();
        this.totalFrames=Object.keys(ss.textures).length;
		this.player=(option?.player)?option.player:MCPlayer.getInstance();
		this.player.addMC(this);
		this.timeline=this.initTimeline();
        this.aniS=new AnimatedSprite(Object.values(ss.textures))
        this.aniS.stop();
        this.addChild(this.aniS);
    }

	protected initTimeline():Timeline{
		return new Timeline(this.totalFrames);
	}

	public showFrame(frame:uint):void{
		this.showEffect();
        this.aniS.gotoAndStop(frame-1);
    }
}