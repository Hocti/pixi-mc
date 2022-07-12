import { Point } from "@pixi/math";
import { MCDisplayObject, MCSymbolModel,TMath, MC } from "..";
import MCPlayer from '../MC/MCPlayer';
//import { action } from '../MCStructure';

export type action={
	name:string,
	begin:uint,
	end:uint,
	keys:Dictionary<uint>
}
/*
export type actorInfo={
	mcModel:MCSymbolModel,
	scale:float,
	position:Point,
	color:ColorChange
}

export class MCActor extends MCDisplayObject{


	private mcList:Dictionary<MC>={};
	private actionList:Dictionary<action>={};

	constructor(_player:MCPlayer=MCPlayer.getInstance()){
		super();
	}

	public addMC(_mc:MC,_info:actorInfo):void{
		if(!this.mcList[_mcs.name]){
			const mc=new MC(_mcs);
			
			this.addChild(mc);
			this.mcList[_mcs.name]=mc;
		}
	}

	public showAction(action_name:string,key_start?:string,key_end?:string,ratio:float=0,half_frame:boolean=false):void{
		const a=this.actionList[action_name];
		if(a){
			let start_f:float=a.begin;
			let end_f:float=a.end;
			if(key_start){
				if(a.keys[key_start]){
					start_f=a.keys[key_start]
				}else{
					console.error(`not contain key start: ${action_name} ${key_start}`);
					return
				}
			}
			if(key_end){
				if(a.keys[key_end]){
					end_f=a.keys[key_end]
				}else{
					console.error(`not contain key start: ${action_name} ${key_end}`);
					return
				}
			}
			ratio=TMath.clamp(ratio,0,1);
			if(ratio===0){
				this.showActionFrame(action_name,start_f)
			}else if(ratio===1){
				this.showActionFrame(action_name,end_f)
			}else{
				this.showActionFrame(action_name,end_f+(end_f-start_f)*ratio,half_frame)
			}
		}else{
			console.error(`not contain action: ${action_name}`);
		}
	}

	public showActionFrame(action_name:string,frame:float,half_frame:boolean=false):void{

	}

}
*/