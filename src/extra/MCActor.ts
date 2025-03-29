import { Matrix , SpriteSheet } from 'pixi.js';

import {ImultiMC,MCDisplayObject} from "../MC/display/";

import MCSymbolModel from '../MC/model/MCSymbolModel';
import * as TMath from '../utils/TMath';

import type IMCwithTimeline from '../MC/display/IMCwithTimeline';
import MCEX from './MCEX';
import {IreplacerDisplayObject,MCReplacer} from './MCReplacer';


import {ActionDetail} from '../MC/model/MCStructure';
import MCLibrary from '../MC/model/MCLibrary';
import MCSheet from '../MC/display/MCSheet';


export type Action={
	mcID:uint,
	phases:Record<string,ActionPhase>,//ActionPhase[],
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

type addActionOption={
	replaceSame?:boolean,
	matrix?:Matrix,
	includeActions?:string[],
	excludeActions?:string[],
	prefix?:string
}

/*
adding multi MCEX with action,combine as one MCActor.
MCActor won't play itself, but you can use showAction to jump to the progess of the action with phase support.
you Game Engine have to control the progress of the action by showAction each frame.

If you just want to play the animation with specific frame range, you can use LabelMC.
*/
export default class MCActor extends MCDisplayObject implements IreplacerDisplayObject{

	private actionList:Record<string,Action>={};
	private mcList:IMCwithTimeline[]=[];
	private isMcexType:boolean[]=[];

	private currentMCID:int=-1;

	public get currentMC():IMCwithTimeline | undefined{
		return this.mcList[this.currentMCID]
	}

	protected actionsToList(mcID:uint,actions:Record<string,ActionDetail>):void{
		for(const actionName in actions){
			let action=actions[actionName];
			let phases:Record<string,ActionPhase>={}
			let phaseOrder:string[]=[]
			if(action.phase){
				for(const phaseName in action.phase){
					const phase=action.phase[phaseName];
					phases[phaseName]={
						name:phaseName,
						frame_begin:phase.startFrame+1,
						frame_end:phase.endFrame
					}
					phaseOrder.push(phaseName)
				}
			}
			this.actionList[actionName]={
				mcID,
				name:actionName,
				phases,
				phaseOrder,
				frame_begin:action.range.startFrame+1,
				frame_end:action.range.endFrame
			}
		}
	}

	public addSpriteSheetByKey(key:string){
		const {sheet,actions}=MCLibrary.getSheet(key,true);
		this.addSpriteSheet(sheet,actions!);
	}

	public addSpriteSheet(sheet:SpriteSheet,actions:Record<string,ActionDetail>){
		const mc:MCSheet=new MCSheet(sheet);
		const mcID:uint=this.mcList.length;
		this.mcList.push(mc);
		this.isMcexType.push(false);
		this.actionsToList(mcID,actions);
		return mc;
	}

	public addModelByKey(key:string){
		const {symModel,actions}=MCLibrary.getSymbolWithAction(key);
		this.addModelWithActions(symModel,actions!);
	}

	public addModelWithActions(symbolModel:MCSymbolModel,actions:Record<string,ActionDetail>){
		const mc:MCEX=new MCEX(symbolModel);
		const mcID:uint=this.mcList.length;
		this.mcList.push(mc);
		this.isMcexType[mcID]=false;
		this.actionsToList(mcID,actions);
		return mc;
	}

	public addModel(symbolModel:MCSymbolModel,option?:addActionOption):MCEX{
		const mc:MCEX=new MCEX(symbolModel);
		const mcID:uint=this.mcList.length;
		this.mcList.push(mc);
		this.isMcexType.push(true);
		
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
				
				const phases:Record<string,ActionPhase>={};
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
				mc.setFromMatrix(option.matrix);//*pixiv8
			}
		}

		mc.timeline.stop();
		if(this.currentMCID===-1 && firstAction){
			this.showAction(firstAction);
		}

		return mc
	}

	/*
	public addAction(actionName:string,phaseName?:string,progress:number=0):void{//,halfFrame:boolean=false
		this.actionList[actionName]={}
		
	}
	*/

	public showAction(actionName:string,phaseName?:string,progress:number=0):void{//,halfFrame:boolean=false
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

		let targetFrameFloat:number=action.frame_begin;
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
		if(actionName==='jump'){
			console.log(Math.round(targetFrameFloat))
		}
		if(halfFrame){
			//TODO
			//this.mcList[this.currentMCID].showFloatFrame(targetFrameFloat);
		}
		*/
	}

	public checkAction(actionAndPhase:Record<string,string[]>):boolean{
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

	public getActions():Record<string,string[]>{
		const acts:Record<string,string[]>={}
		for(const action in this.actionList){
			acts[action]=this.actionList[action].phaseOrder;
		}
		return acts;
	}

	public getActionList():string[]{
		return Object.keys(this.actionList);
	}

	public getActionPhase(actionName:string):string[]{
		return this.actionList[actionName].phaseOrder;
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
		if(this.currentMC && this.isMcexType[this.currentMCID]){
			(this.currentMC as MCEX).onRenew();
		}
    }
}