import * as PIXI from "pixi.js"
import EventEmitter from "@pixi/utils"
import {Loader,LoaderResource} from "@pixi/loaders"
import {Container} from '@pixi/display'

import {fileInfo,folderInfo,FileList} from '../utils/FileList';
import MCModel from './MCModel';
import MCDisplayObject from './MCDisplayObject';
import { getTimer } from '../utils/utils';
import MC from './MC';

export enum MCEvent{
	LoadDone ='loadDone',
	Error ='error',
}

export default class MCLoader extends PIXI.utils.EventEmitter{
	
	constructor(_mc_folder?:folderInfo | string[],_loadcall?:PIXI.utils.EventEmitter.ListenerFn) {
		super()
		if(_mc_folder){
			this.load(_mc_folder,_loadcall)
		}
	}

	public static loadContainer(_args:folderInfo | string[],_loadcall?:PIXI.utils.EventEmitter.ListenerFn):Container{
		const container=new Container();
		const loader=new MCLoader(_args);
		loader.on(MCEvent.LoadDone,(event:any)=>{
			const instance:MC=<MC>(<MCModel>event.model).makeInstance()
			container.addChild(instance)
			if(_loadcall){
				_loadcall.call(this,{
					type:'loadDone',
					content:instance,
					loader:container
				})

			}
		});
		return container
	}

	public load(_args:folderInfo | string[],_loadcall?:PIXI.utils.EventEmitter.ListenerFn) {//* in node: rootPath only, or zip
		let _mc_folder!:folderInfo;
		let fileList:string[]=[];
		let rootPath:string='';
		if((<folderInfo>_args).path){//folderInfo
			_mc_folder=<folderInfo>_args;
			rootPath=_mc_folder.path;
			fileList=[..._mc_folder.files.map(v=>v.path)];
			if(rootPath.substr(-1)!='/')rootPath+='/'
		}else{//string[]
			fileList=<string[]>_args;
			let pathArr=fileList[0].split('/');
			pathArr.pop();
			rootPath=pathArr.join('/')+'/';
		}

		if(_loadcall){
			this.on(MCEvent.LoadDone,_loadcall);
		}

		let myloader=new Loader();
		
		let sheet_count=0;

		for(let v of fileList){
			//if(v.type=='json' || v.type=='png' || v.type=='wav' || v.type=='mp3' || v.type=='jpg'){
			if(!Loader.shared.resources[v]){
				myloader.add(v);
			}
			let fi=FileList.pathToInfo(v,rootPath);
			if(fi.name.substring(0,9)=="spritemap" && fi.type=="json"){
				sheet_count=Math.max(sheet_count,Number(fi.name.substr(9,fi.name.length-9-5)));
			}
		}
		myloader.load((loader:Loader, resources: Partial<Record<string, LoaderResource>>)=>{//*to a new functiom, use bind?
			const aniDataPath=rootPath+'Animation.json';
			const frameDataPath=rootPath+'Frame.json';
			const skinDataPath=rootPath+'Skin.json';

			for(let k in resources){//cache in global
				if(resources[k]!.error){
					console.error(`load file error:${k}`)
				}else if(!Loader.shared.resources[k]){
					Loader.shared.resources[k]=resources[k]!; //* may be fail?
				}
			}
			if(!Loader.shared.resources[aniDataPath]){
				console.error('not contain `Animation.json`')
				this.emit(MCEvent.Error,{
					message:'not contain `Animation.json`'
				});
				return
			}
			if(Loader.shared.resources[frameDataPath]){
				//* stop/loop + sound script
			}
			if(Loader.shared.resources[skinDataPath]){
				//*
			}
			let spritemaps:any[]=[];
			for(let ss=1;ss<=sheet_count;ss++){
				let d=Loader.shared.resources[rootPath+'spritemap'+ss+'.json'].data
				
				//_data.spritesheet.push(Spritemap.toSpritesheet(Loader.shared.resources[rootPath+d.meta.image].texture,d))
				spritemaps.push(d)
				//image.push(rootPath+d.meta.image)
			}
			let mainModel:MCModel=new MCModel(Loader.shared.resources[aniDataPath].data,spritemaps,rootPath);
			this.emit(MCEvent.LoadDone,{
				model:mainModel
			});
		});
	}
}