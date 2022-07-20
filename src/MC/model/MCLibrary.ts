import MCModel from './MCModel'
import MCSymbolModel from './MCSymbolModel';

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

	public static get(key:string):MCModel {
		if(!this.mcList[key]){
			throw `MC Model ${key} not find!`;
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

}