import {EventEmitter, Point} from 'pixi.js';
import {Container} from 'pixi.js'
import { Assets } from 'pixi.js';
import { SpriteSheet } from 'pixi.js';

import {spriteData,SpriteSheetData,ActionDetail} from './MCStructure';
import MCModel from './MCModel';
import MC from '../display/MC';
import MCLibrary from './MCLibrary';

export enum MCLoaderEvent{
	LoadDone ='loadDone',
	Error ='error',
}

const action_json_name='actions.json';

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

	public static async loadSpriteSheet(_ssJsonPath:string,_actionPath?:string){
		const dirname=_ssJsonPath.split('/').slice(0,-1).join('/')+'/';
		const basename=_ssJsonPath.split('/').at(-1)??'';
		const withoutExt=basename.split('.').slice(0,-1).join('.')
		const ext=basename.split('.').at(-1)??'';
		const codeName=_ssJsonPath;//dirname+withoutExt;

		const ss_data=await Assets.load(_ssJsonPath)

		let imageName=basename+'.png';
		const pivot:Point=new Point(0,0)
		const frame:Point=new Point(0,0)
		let sheet:SpriteSheet;
		if(ext==='xml'){
			const imgReg=/imagePath="([^"]+.png)">/g.exec(ss_data);
			if(imgReg && imgReg.length>1){
				imageName=imgReg[1];
			}
			const xData:Record<string,number>[]=ss_data.split('<').filter((v:string)=>v.startsWith('SubTexture ')).map((v:string)=>{
				const obj:Record<string,number>={
					x:0,
					y:0,
					width:0,
					height:0,
					frameX:0,
					frameY:0,
					frameWidth:0,
					frameHeight:0,
					pivotX:0,
					pivotY:0,
				}
				v.substring(0,v.indexOf('/')).split(' ').map((v:string)=>{
					const dat=/^([a-zA-Z]*)="([-\d]*)"$/g.exec(v);
					if(dat && dat.length>2){
						//console.log(dat[1],dat[2])
						obj[dat[1]]=parseInt(dat[2])
					}
				})
				if(obj.pivotX!=0){
					pivot.x=obj.pivotX
					pivot.y=obj.pivotY
				}
				if(obj.frameWidth && !frame.x){
					frame.x=obj.frameWidth;
				}
				if(obj.frameHeight && !frame.y){
					frame.y=obj.frameHeight;
				}
				return obj
			})
			const x2ssData:SpriteSheetData={frames:{},meta:{image:imageName,format: 'RGBA8888',scale:1}}
			for(const f in xData){
				const x=xData[f];
				x2ssData.frames[`${withoutExt}_${f}`]={
					frame: {x: x.x, y: x.y, w: x.width, h: x.height},
					spriteSourceSize: {x: -x.frameX, y: -x.frameY, w: frame.x, h: frame.y},
					rotated: false,
					trimmed: true,
					sourceSize: {w: frame.x, h: frame.y}
				}
			}
			x2ssData.frames[Object.keys(x2ssData.frames)[0]].anchor={
				x:pivot.x/frame.x,
				y:pivot.y/frame.y
			}
			const basetexture=await Assets.load(dirname+imageName);
			sheet = new SpriteSheet(basetexture, x2ssData);
			await sheet.parse();
		}else{
			for(const frameName in ss_data.data.frames){
				const frameData=ss_data.data.frames[frameName]
				if(frameData.frame.w===0){
					pivot.x=-frameData.spriteSourceSize.x
				}
				if(frameData.frame.h===0){
					pivot.y=-frameData.spriteSourceSize.y
				}
			}
			if(pivot.x!==0 || pivot.y!==0){
				console.log('pivot changed',pivot)
				ss_data.data.frames[Object.keys(ss_data.data.frames)[0]].anchor={x: 0.5, y: 0.98}
				//ss_data._frames[Object.keys(ss_data._frames)[0]].anchor={x: 0.5, y: 0.98}
				//ss_data.textures[Object.keys(ss_data.textures)[0]].anchor={x: 0.5, y: 0.98}
				const basetexture=await Assets.load(dirname+ss_data.data.meta.image);
				sheet = new SpriteSheet(basetexture, ss_data.data)
				await sheet.parse();
			}else{
				sheet=ss_data
			}
		}

		let actionData:Record<string,ActionDetail>|undefined
		if(ss_data.action){
			actionData=ss_data.actions;
		}else{
			const dataPath=_actionPath?_actionPath:dirname+withoutExt+'_'+action_json_name;
			const actionRaw=await Assets.load(dataPath).catch((e)=>{
				if(_actionPath){
					console.error(e)
				}
			})
			if(actionRaw && actionRaw.actions){
				actionData=actionRaw.actions;
			}
		}
			if(actionData){
				MCLibrary.pushAction(actionData,codeName);
			}

		MCLibrary.pushSheet(sheet,codeName);

		return sheet

	}

	public static async autoLoadModel(_folder:string,_maxSpritemap:number=0,otherFiles:string[]=[],extenalFiles:string[]=[]):Promise<MCModel>{
		const files:string[]=['Animation.json',...otherFiles];

		
		if(!await this.checkFileExists(_folder+'Animation.json')){
			return Promise.reject(`Can't find Animation.json file in ${_folder}`);
		}
		
		if(await this.checkFileExists(_folder+action_json_name)){
			files.push(action_json_name);
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

		if(loadResult[_folder+action_json_name]){
			//console.log('addModelByKey',loadResult[_folder+action_json_name],_folder)
			MCLibrary.pushAction(loadResult[_folder+action_json_name].actions,_folder);
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