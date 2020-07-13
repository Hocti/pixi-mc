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
	static ticker:PIXI.Ticker;
	public static initTicker(_ticker:PIXI.Ticker){
		MCPlayer.ticker=_ticker;
	}

	//private
	private currf=1;
	private realf=1;
	private mcList:MC[]=[];
	private enterTick(delta:number) {//* delta=f in 60fps
		//console.log(MCPlayer.ticker.deltaMS,MCPlayer.ticker.elapsedMS )
		this.realf+=delta*this.fps*(1/60)
		const realFloor=Math.floor(this.realf);
		if(realFloor==this.currf){
			//*or do half frame
			return
		}
		let lastFrame=this.currf
		this.currf=realFloor
		for(let mc of this.mcList){
			if(!mc)continue
			if(!mc.timeline.active)continue
			if(!mc.worldVisible )continue
			mc.timeline.processFrame();
			mc.showFrame(mc.timeline.currentFrame);
		}
	}
	//public
	public fps=60;
	public addMC(mc:MC){
		this.mcList.push(mc)
	}
}