import MCModel from './MCModel'
export default class MCLibrary {
	private static instance: MCLibrary;
	private constructor() {}
	static getInstance(): MCLibrary {
		if (!MCLibrary.instance) {
			MCLibrary.instance = new MCLibrary();
		}
		return MCLibrary.instance;
	}
	//

	private mcList:{ [id: string] : MCModel }={};

	public push(_obj:MCModel,key:string=""):void {
		this.mcList[key]=_obj;
	}

	public get(key:string):MCModel {
		if(!this.mcList[key]){
			throw `MC Model ${key} not find!`;
		}
		return this.mcList[key];
	}
}
/*
SKIN

symbol,asi not save
*/