import {EventEmitter} from 'pixi.js';
import {Container} from 'pixi.js'
import { Assets } from 'pixi.js';

import {spriteData} from './MCStructure';
import MCModel from './MCModel';
import MC from '../display/MC';
import MCLibrary from './MCLibrary';

export enum MCLoaderEvent{
	LoadDone ='loadDone',
	Error ='error',
}

export default class MCLoader extends EventEmitter{

	//Load Model=============
	

	public static async checkFileExists(fileUrl: string): Promise<boolean> {
		try {
			const response = await fetch(fileUrl, { method: 'HEAD' });
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	public static async autoLoadModel(_folder:string,_maxSpritemap:number=0,otherFiles:string[]=[],extenalFiles:string[]=[]):Promise<MCModel>{
		const files:string[]=['Animation.json',...otherFiles];

		
		if(!await this.checkFileExists(_folder+'Animation.json')){
			return Promise.reject(`Can't find Animation.json file in ${_folder}`);
		}

		if(_maxSpritemap===0){
			let checking=2;
			let confirmedMax=0;
			let confirmedFail=1000;
			do{
				const result=await this.checkFileExists(_folder+'spritemap'+checking+'.json')
				if(result){
					confirmedMax=checking;
					if(confirmedMax+1==confirmedFail){
						break;
					}
					checking+=3;
				}else{
					confirmedFail=checking;
					checking--;
				}
			}while(checking>0);
			if(confirmedMax===0){
				return Promise.reject(`Can't find spritemap json file in ${_folder}`);
			}
			_maxSpritemap=confirmedMax;
		}
		
		for(let i=1;i<=_maxSpritemap;i++){
			files.push('spritemap'+i+'.json');
			files.push('spritemap'+i+'.png');
		}
		return MCLoader.loadModel(_folder,files,extenalFiles);
	}

	//Animation.json,spritemap1.json~spritemapX.json,mp3 or wav
	public static async loadModel(_folder:string,_files:string[],extenalFiles:string[]=[]):Promise<MCModel>{
		
		const modelFromLibrary=MCLibrary.get(_folder)
		if(modelFromLibrary){
			return Promise.resolve(modelFromLibrary)
		}

		const filesRecord:Record<string,string>={}
		for(const file of _files){
			filesRecord[_folder+file]=_folder+file;
		}
		for(const file of extenalFiles){
			filesRecord[file]=file;
		}

		return this.loadModelFiles(_folder,filesRecord);
	}
	
	public static async loadModelFiles(_folder:string,filesRecord:Record<string,string>):Promise<MCModel>{
		
		Assets.addBundle(_folder,filesRecord)

		const loadResult = await Assets.loadBundle(_folder).catch((e)=>{
			return Promise.reject(e);
		});

		let spritemaps:spriteData[]=[];
		let AniKey:string='';
		for(const key in loadResult){
			if(key.indexOf('spritemap')>=0 && key.indexOf('.json')>0){
				spritemaps.push(loadResult[key]);
			}
			if(key.indexOf('Animation.json')>=0){
				AniKey=key
			}
		}

		return Promise.resolve(new MCModel(
			loadResult[AniKey],
			spritemaps,
			_folder));
		
	}

	//Load Multi Model=============

	public static loadModels(_folderPaths:string[]):Promise<MCModel[]>{
		return Promise.all(_folderPaths.map((p)=>this.autoLoadModel(p)))
	}

	/*

	//unLoad=============

	public static unload(modelname:string):void {
		TODO
		remove all model,sub model instance
		clean ASI base texture cache
		clean ASI model cache

		remove resuorces in Loader
	}

	public static unloadMulti(modelnames:string[]):void {
		for(const modelname of modelnames){
			MCLoader.unload(modelname)
		}
	}

	*/

	//Load Container=============

	public static createLoaderContainer(_folder:string,_loadcall?:(loader:Container,content:MC)=>void):Container{
		const container=new Container();
		MCLoader.autoLoadModel(_folder).then((model:MCModel)=>{
			const instance:MC=<MC>(model).makeInstance()
			container.addChild(instance)
			if(_loadcall){
				_loadcall.call(this,container,instance);
			}
		});
		return container
	}
}

/*
TODO:
load model only, without image and sprite
unload
*/