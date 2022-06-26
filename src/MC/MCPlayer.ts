import {Ticker} from '@pixi/ticker';

import MC from './MC';
import MCScene from './MCScene';
export default class MCPlayer {

	//singleton
	private static instance: MCPlayer;
	constructor() {
		if(!MCPlayer.ticker){
			console.error('not initTicker')
			return
		}
		MCPlayer.ticker.add(this.enterTick.bind(this))
	}
	static getInstance(): MCPlayer {
		if (!MCPlayer.instance) {
			MCPlayer.instance = new MCPlayer();
		}
		return MCPlayer.instance;
	}
	//static init
	static ticker:Ticker;
	public static initTicker(_ticker:Ticker){
		MCPlayer.ticker=_ticker;
	}

	//private
	private currFrame:uint=1;
	private realFloatFrame:float=1;
	private mcList:MC[]=[];
	private enterTick(delta:float) {//* delta=f in 60fps
		/*
		if(this.realFloatFrame<100){
			console.log(MCPlayer.ticker.deltaMS,MCPlayer.ticker.elapsedMS,delta )
			
		}
		*/
		
		this.realFloatFrame+=delta*this.fps*(1/MCPlayer.ticker.FPS )
		const realIntFrame:uint=Math.round(this.realFloatFrame);
		if(realIntFrame==this.currFrame){
			//*or do half frame
			return
		}
		let lastFrame:uint=this.currFrame
		this.currFrame=realIntFrame

		let removed=0;
		for(let mc of this.mcList){
			if(!mc){
				removed++;
				continue
			}
			//*remove from list

			if(!mc.timeline.active)continue
			if(!mc.worldVisible )continue
			mc.timeline.processFrame();
			mc.showFrame(mc.timeline.currentFrame);
		}
		if(removed>50){
			//*GC

		}
	}
	//public
	public fps:float=60;
	public addMC(mc:MC){
		this.mcList.push(mc)
	}
}