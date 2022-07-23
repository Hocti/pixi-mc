import { Matrix } from "@pixi/math";

import {ImultiMC,MCDisplayObject} from "../MC/display/";

import MCSymbolModel from '../MC/model/MCSymbolModel';
import * as TMath from '../utils/TMath';

import MCEX from './MCEX';
import {IreplacerDisplayObject,MCReplacer} from './MCReplacer';

export type Action={
	mcID:uint,
	phases:Dictionary<ActionPhase>,//ActionPhase[],
	phaseOrder:string[],//ActionPhase[],
	name:string,
	frame_begin:uint,
	frame_end:uint
}
export type ActionPhase={
	name:string,
	frame_begin:uint,
	frame_end:uint
}


export default class MCActor extends MCDisplayObject implements IreplacerDisplayObject,ImultiMC{

	private actionList:Dictionary<Action>={};
	private mcList:MCEX[]=[];

	private currentMCID:int=-1;

	public get currentMC():MCEX | undefined{
		return this.mcList[this.currentMCID];
	}

	public addModel(symbolModel:MCSymbolModel,option?:{
			replaceSame?:boolean,
			matrix?:Matrix,
			includeActions?:string[],
			excludeActions?:string[],
			prefix?:string
		}):MCEX{
		const mc:MCEX=new MCEX(symbolModel);
		const mcID:uint=this.mcList.length;
		this.mcList.push(mc);
		
		let firstAction:string | null | undefined;
		if(symbolModel.extraRemarks['action']){
			for(const action of symbolModel.extraRemarks['action']){
				if(!action.args[0] && !action.frame_label){
					console.error('action name error',action,symbolModel)
					continue;
				}

				const actionName:string=(option?.prefix)+action.args[0]?action.args[0]:action.frame_label!;

				if(option?.excludeActions?.includes(actionName)){
					continue;
				}else if(option?.includeActions && !option?.includeActions?.includes(actionName)){
					continue;
				}else if(this.actionList[actionName]!==undefined && option?.replaceSame!==true){
					continue;
				}
				
				const phases:Dictionary<ActionPhase>={};
				let phaseOrder:string[]=[];
				for(const phase of symbolModel.extraRemarks['phase']){
					if(phase.frame_begin>=action.frame_begin && phase.frame_begin<=action.frame_end){
						const phaseName:string=phase.args[0]?phase.args[0]:(phase.frame_label?phase.frame_label:'phase');
						phases[phaseName]={
							name:phaseName,
							frame_begin:phase.frame_begin,
							frame_end:phase.frame_end
						};
						phaseOrder.push(phaseName)
					}
				}
				phaseOrder.sort((a,b)=>phases[a].frame_begin-phases[b].frame_begin);

				this.actionList[actionName]={
					mcID,
					name:actionName,
					phases,
					phaseOrder,
					frame_begin:action.frame_begin,
					frame_end:action.frame_end
				}
				if(!firstAction){
					firstAction=actionName;
				}
			}

		}

		if(option){
			if(option.matrix){
				mc.transform.setFromMatrix(option.matrix);
			}
		}

		mc.timeline.stop();
		if(this.currentMCID===-1 && firstAction){
			this.showAction(firstAction);
		}

		return mc
	}

	public showAction(actionName:string,phaseName?:string,progress:float=0):void{//,halfFrame:boolean=false
		progress=TMath.clamp(progress,0,1);
		const action=this.actionList[actionName];
		if(!action){
			console.error(`action not found: ${actionName}`);
			return
		}
		
		if(this.currentMCID!=action.mcID){
			this.removeChild(this.mcList[this.currentMCID]);
			this.currentMCID=action.mcID;
			this.addChild(this.mcList[this.currentMCID]);
		}

		let targetFrameFloat:float=action.frame_begin;
		if(phaseName){
			//for(const phase of action.phases){
			for(const phaseKey in action.phases){
				const phase=action.phases[phaseKey];
				if(phase.name===phaseName){
					if(progress>0){
						targetFrameFloat=phase.frame_begin+(phase.frame_end-phase.frame_begin)*progress;
					}else{
						targetFrameFloat=phase.frame_begin;
					}
					break;
				}
			}
		}else if(progress>0){
			targetFrameFloat=action.frame_begin+(action.frame_end-action.frame_begin)*progress;
		}

		this.mcList[this.currentMCID].timeline.gotoAndStop(Math.round(targetFrameFloat));
		
		/*
		if(halfFrame){
			//TODO
			//this.mcList[this.currentMCID].showFloatFrame(targetFrameFloat);
		}
		*/
	}

	public checkAction(actionAndPhase:Dictionary<string[]>):boolean{
		for(const action in actionAndPhase){
			if(this.actionList[action]===undefined){
				return false;
			}
			for(const phase of actionAndPhase[action]){
				if(this.actionList[action].phases[phase]===undefined){
					return false;
				}
			}
		}
		return true;
	}


	protected destroyOption={
		children:true,texture:false
	}
	
	public destroy(){
		this.mcList.forEach(mcex => {
			mcex.destroy()
		});
		super.destroy(this.destroyOption)
	}

	//replacer=============
	
    public replacer:MCReplacer=new MCReplacer(this);

    public onRenew():void{
		this.currentMC?.onRenew();
    }
}