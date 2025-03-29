import MCModel from './MCModel'
import MCSymbolModel from './MCSymbolModel';
import { SpriteSheet } from 'pixi.js';
import {spriteData,SpriteSheetData,ActionDetail} from './MCStructure';

export default class MCLibrary {

	private static mcList:{ [id: string] : MCModel }={};

	public static push(_obj:MCModel,key:string=""):void {
		this.mcList[key]=_obj;
	}

	/*
	TODO?
	public static remove(key:string=""):void {
		this.mcList[key]=undefined;
	}
	*/

	public static get(key:string):MCModel|undefined {
		if(!this.mcList[key]){
			//throw `MC Model ${key} not find!`;
			return undefined;
		}
		return this.mcList[key];
	}

	public static getSymbol(key:string,symbolName?:string):MCSymbolModel {
		if(!this.mcList[key]){
			throw `MC Model ${key} not find!`;
		}
		if(symbolName){
			if(!this.mcList[key].symbolList[symbolName]){
				throw `MC Model ${key} not contain ${symbolName} !`;
			}
			return this.mcList[key].symbolList[symbolName];
		}
		return this.mcList[key].mainSymbolModel;
	}

	public static getKeyFromModel(_obj:MCModel):string | undefined{
		for(const key in this.mcList){
			if(this.mcList[key]===_obj){
				return key;
			}
		}
		return undefined
	}

	//----------------

	
	private static actionLibrary:{ [id: string] : Record<string,ActionDetail> }={};

	public static pushAction(actions:Record<string,ActionDetail>,key:string):void {
		this.actionLibrary[key]=actions;
	}

	private static spritesheetLibrary:{ [id: string] : SpriteSheet }={};

	public static pushSheet(_ss:SpriteSheet,key:string):void {
		this.spritesheetLibrary[key]=_ss;
	}

	public static getSymbolWithAction(key:string):{
		symModel:MCSymbolModel,
		actions?:Record<string,ActionDetail>
	} {
		const actionData=this.actionLibrary[key];
		if(!this.actionLibrary[key]){
			throw `action ${key} not contain`;
		}
		return {
			symModel:this.getSymbol(key),
			actions:actionData
		}
	}

	public static getSheet(key:string,withAction:boolean=false):{
		sheet:SpriteSheet,
		actions?:Record<string,ActionDetail>
	} {
		if(!this.spritesheetLibrary[key]){
			throw `MC Model ${key} not find!`;
		}
		if(!withAction){
			return {
				sheet:this.spritesheetLibrary[key]
			}
		}
		if(!this.actionLibrary[key]){
			throw `action ${key} not contain`;
		}
		return {
			sheet:this.spritesheetLibrary[key],
			actions:this.actionLibrary[key]
		}
	}

}