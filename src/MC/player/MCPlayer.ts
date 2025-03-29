import {Ticker} from 'pixi.js';
//import {MC} from '../display';
import type IMCwithTimeline from '../display/IMCwithTimeline';

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
			if(!MCPlayer.ticker){
				MCPlayer.initTicker();
			}
			MCPlayer.instance = new MCPlayer();
			MCPlayer.instance.fps=MCPlayer.ticker.FPS;
		}
		return MCPlayer.instance;
	}

	//static init

	static ticker:Ticker;

	public static initTicker(ticker?:Ticker){
		if(!ticker){
			ticker = Ticker.shared;
		}
		MCPlayer.ticker=ticker;
	}

	//private

	private currFrame:uint=1;

	private realFloatFrame:number=1;

	private mcList:IMCwithTimeline[]=[];

	private enterTick(ticker:Ticker) {//* delta=f in 60fps
		const delta:number=ticker.deltaTime; //number
		this.realFloatFrame+=delta*this.fps*(1/MCPlayer.ticker.FPS )
		const realIntFrame:uint=Math.round(this.realFloatFrame);
		if(realIntFrame===this.currFrame){
			//*or do half frame
			return
		}

		let lastFrame:uint=this.currFrame
		this.currFrame=realIntFrame

		let removed=0;
		for(let mc of this.mcList){
			//TODO
			if(!mc){
				removed++;
				continue
			}
			//*remove from list

			if(!mc.timeline.active)continue
			//if(!mc.worldVisible )continue
			mc.timeline.processFrame();
			if(!mc.parent)continue
			mc.showFrame(mc.timeline.currentFrame);
		}
		if(removed>50){
			this.mcList = this.mcList.filter(element => {
				return element !== undefined;
			});
		}
	}

	public fps:number=0;

	public addMC(mc:IMCwithTimeline){
		this.mcList.push(mc)
	}
}