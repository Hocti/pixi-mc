import {EventEmitter} from '@pixi/utils';
import {Loader,LoaderResource} from '@pixi/loaders';
import {Container} from '@pixi/display'

import {spriteData} from './MCStructure';
import {fileInfo,folderInfo,FileList} from '../../utils/FileList';
import MCModel from './MCModel';
import MC from '../display/MC';
import MCLibrary from './MCLibrary';

export enum MCEvent{
	LoadDone ='loadDone',
	Error ='error',
}


type loadDoneEvent={
	model:MCModel
}

export default class MCLoader extends EventEmitter{

	//Load Model=============

	public static async loadModelAsync(_args:folderInfo | string[]):Promise<MCModel>{
		const [rootPath,fileList]=FileList.getFilesFromFolder(_args);

		const aniDataPath=rootPath+'Animation.json';
		
		if(fileList.indexOf(aniDataPath)===-1){
			return Promise.reject(new Error(`${rootPath} not contain 'Animation.json'`))
		}

		const addList:string[]=[];
		let sheet_count=0;
		for(let v of fileList){
			//if(v.type==='json' || v.type==='png' || v.type==='wav' || v.type==='mp3' || v.type==='jpg'){
			if(!Loader.shared.resources[v]){
				addList.push(v)
			}

			let fi=FileList.pathToInfo(v,rootPath);
			if(fi.name.substring(0,9)==="spritemap" && fi.type==="json"){
				//sheet_count=Math.max(sheet_count,Number(fi.name.substr(9,fi.name.length-9-5)));
				sheet_count=Math.max(sheet_count,Number(fi.name.substring(9,fi.name.length-5)));
			}
		}

		if(addList.length===0){
			const modelFromLibrary=MCLibrary.get(rootPath)
			if(modelFromLibrary){
				return Promise.resolve(modelFromLibrary)
			}
		}

		return new Promise((resolve, reject) => {
			
			let myloader=new Loader();
			for(let v of addList){
				myloader.add(v);
			}
			myloader.load((loader:Loader, resources: Partial<Record<string, LoaderResource>>)=>{//*to a new functiom, use bind?
				
				for(let k in resources){//cache in global
					if(resources[k]!.error){
						return reject(`load file error:${k}`);
					}else if(!Loader.shared.resources[k]){
						Loader.shared.resources[k]=resources[k]!; //* may be fail?
					}
				}

				//check Animation.json
				if(!Loader.shared.resources[aniDataPath]){
					return reject(`${rootPath} not contain 'Animation.json' (files.txt contain file not exsit)`);
				}
				
				//check spritemap.json and png
				let spritemaps:spriteData[]=[];
				for(let ss=1;ss<=sheet_count;ss++){
					let d:spriteData=Loader.shared.resources[rootPath+'spritemap'+ss+'.json'].data as spriteData;
					spritemaps.push(d)
				}

				myloader.destroy();
				resolve(new MCModel(Loader.shared.resources[aniDataPath].data,spritemaps,rootPath));
			});
			/*
			myloader.onComplete.add(() => {
				//console.log('onComplete')
				resolve(mainModel);
			});
		
			myloader.onError.add(() => {
				reject();
			});
			*/
		  });
	}

	public static loadModel(_args:folderInfo | string[],_loadcall?:{(args:MCModel):void}) {
		MCLoader.loadModelAsync(_args).then(_loadcall);
	}

	//Load Multi Model=============

	public static async loadModelsAsync(_folderPaths:string[],_root:string=''):Promise<MCModel[]>{
		const promiseList:Promise<MCModel>[]=[];
		for(let folderPath of _folderPaths){
			promiseList.push(MCLoader.loadModelAsync(FileList.getInstance().getFolderInfoFromPath(_root+folderPath)));
		}
		return Promise.all(promiseList);
	}

	public static loadModels(_folderPaths:string[],_root:string='',_loadcall?:{(args:MCModel[]):void}):void{
		const promiseList:Promise<MCModel>[]=[];
		for(let folderPath of _folderPaths){
			promiseList.push(MCLoader.loadModelAsync(FileList.getInstance().getFolderInfoFromPath(_root+folderPath)));
		}
		Promise.all(promiseList).then((results)=>{
			if(_loadcall){
				_loadcall(results)
			}
		});
	}

	//unLoad=============

	public static unload(modelname:string):void {
		/*TODO
		remove all model,sub model instance
		clean ASI base texture cache
		clean ASI model cache

		remove resuorces in Loader
		*/
	}

	public static unloadMulti(modelnames:string[]):void {
		for(const modelname of modelnames){
			MCLoader.unload(modelname)
		}
	}

	//Load Container=============

	public static createLoaderContainer(_args:folderInfo | string[],_loadcall?:EventEmitter.ListenerFn):Container{
		const container=new Container();
		MCLoader.loadModel(_args,(model:MCModel)=>{
			const instance:MC=<MC>(model).makeInstance()
			container.addChild(instance)
			if(_loadcall){
				_loadcall.call(this,{
					type:MCEvent.LoadDone,
					content:instance,
					loader:container
				})
			}
		});
		return container
	}

	//unuse?=============

	constructor(_mc_folder?:folderInfo | string[],_loadcall?:EventEmitter.ListenerFn) {
		super()
		if(_mc_folder){
			this.load(_mc_folder,_loadcall)
		}
	}

	public load(_args:folderInfo | string[],_loadcall?:EventEmitter.ListenerFn) {//* in node: rootPath only, or zip
		MCLoader.loadModelAsync(_args).then((model)=>{
			const doneEvent:loadDoneEvent={
				model
			}
			this.emit(MCEvent.LoadDone,doneEvent);
			if(_loadcall)_loadcall(doneEvent)
		}, (message)=>{
			this.emit(MCEvent.Error,{
				message
			});
		});
	}
}

/*
TODO:
load model only, without image and sprite
unload
*/