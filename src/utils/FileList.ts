import {Loader,LoaderResource} from '@pixi/loaders';

export type fileInfo={
	path:string;
	name:string;
	type:string;
	folder:string;
	size:uint;
}

export type folderInfo={
	path:string;
	files:fileInfo[];
}

export class FileList {

	private static instance: FileList;
	
	private constructor() {}

	static getInstance(): FileList {
		if (!FileList.instance) {
			FileList.instance = new FileList();
		}
		return FileList.instance;
	}

	//put

	private allFiles:Dictionary<fileInfo>={};

	private push_many(_farr:fileInfo[]) {
		for(const f of _farr){
			this.allFiles[f.path]=f;
		}
		//this.farr.push(..._farr)
		//* make composite list
	}

	public getFolderInfoFromPath(_path:string,_subfolder:boolean=false):folderInfo {
		let l:uint=_path.length;
		let arr:fileInfo[]=[];
		for(let k in this.allFiles){
			if(k.substring(0,l)==_path){
				if(!_subfolder && k.substring(l+1).indexOf('/')>0){
					continue
				}
				arr.push(this.allFiles[k])
			}
		}
		return {
			path:	_path,
			files:	arr
		}
	}

	//static===================

	public static getfolderInfoFromText(_listpath:string,_basepath:string='./',_call:Function){
		let loader=new Loader()
		loader.add(_listpath).load(function(loader:Loader, resources: Partial<Record<string, LoaderResource>>){
			
			let arr:string[]=(<string>((<LoaderResource>resources[_listpath]).data)).split("\n");
			let farr:fileInfo[]=[];
			for(let v of arr){
				let arr2:string[]=(<string>v).split("\t");
				if(arr2.length<2)continue
				let f=FileList.pathToInfo(arr2[0],_basepath);
				f.size=Number(arr2[1]);
				farr.push(f)
			}
			FileList.getInstance().push_many(farr);

			let fi:folderInfo={
				path:	_basepath,
				files:	farr
			}
			_call(fi)
			loader.destroy();
		})
	}

	public static async getfolderInfoFromTextAsync(_listpath:string,_basepath:string='./'):Promise<fileInfo[]>{
		return new Promise((resolve) => {
			FileList.getfolderInfoFromText(_listpath,_basepath,(result:fileInfo[])=>{
				resolve(result);
			})
		})
	}

	public static pathToInfo(_filepath:string,_basepath:string = ""):fileInfo{
		let fname=<string>_filepath.split('/').pop()
		const fullPath=(_basepath+'/'+_filepath).replaceAll('/./','/').replaceAll('///','/').replaceAll('//','/')
		return {
			path:	fullPath,
			name:	fname,
			type:	<string>(fname).split('.').pop(),
			folder:	fullPath.substring(0,fullPath.length-fname.length),
			size:	0
		}
	}

	public static getFilesFromFolder(_args:folderInfo | string[]):[string,string[]]{
		let _mc_folder!:folderInfo;
		let fileList:string[]=[];
		let rootPath:string='';

		if((<folderInfo>_args).path){//is folderInfo
			_mc_folder=<folderInfo>_args;
			rootPath=_mc_folder.path;
			fileList=[..._mc_folder.files.map(v=>v.path)];
			if(rootPath.substring(-1)!=='/')rootPath+='/'
		}else{//is string[]
			fileList=<string[]>_args;
			let pathArr=fileList[0].split('/');
			pathArr.pop();
			rootPath=pathArr.join('/')+'/';
		}
		rootPath=rootPath.replaceAll('//','/')
		return [rootPath,fileList];
	}




	//static get

	/*node only
	const fs=require('fs');
	private static traceFolder(_path:string){
		if(_path.substring(-1)!='/'){
			_path+='/'
		}
		let full_arr=[];
		let arr=fs.readdirSync(_path,{withFileTypes:true})
		for(let v of arr){
			if(v.isDirectory()){
				full_arr.push(...FileList.traceFolder(_path+v.name))
			}else{
				full_arr.push(_path+v.name)
			}
		}
		return full_arr;
	}

	public static getfolderInfoFromPath(_path:string,_call:Function){
		let arr=FileList.traceFolder(_path)
		let content='';
		for(let k of arr){
			var stats = fs.statSync(k)
			content+=`${k}	${stats['size']}\n`;
		}
		FileList.getfolderInfoFromText(content,_call);
	}
	*/
}