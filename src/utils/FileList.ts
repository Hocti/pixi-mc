import {Loader,LoaderResource} from "@pixi/loaders"

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
	private farr:fileInfo[]=[];
	public push_many(_farr:fileInfo[]) {
		this.farr.push(..._farr)
		//* make composite list
	}
	public push(_f:fileInfo) {
		this.farr.push(_f)
	}
	//static get

	/*node only
	const fs=require('fs');
	private static traceFolder(_path:string){
		if(_path.substr(-1)!='/'){
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

	public static getfolderInfoFromText(_listpath:string,_basepath:string='./',_call:Function){
		let loader=new Loader()
		loader.add(_listpath).load(function(loader:Loader, resources: Partial<Record<string, LoaderResource>>){
			let arr:string[]=(<string>((<any>resources[_listpath]).data)).split("\n");
			let farr:fileInfo[]=[];
			for(let v of arr){
				let arr2:string[]=(<string>v).split("\t");
				if(arr2.length!=2)continue
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
		})
	}

	public static pathToInfo(_filepath:string,_basepath:string = ""):fileInfo{
		let fname=<string>_filepath.split('/').pop()
		return {
			path:	_basepath+_filepath,
			name:	fname,
			type:	<string>(fname).split('.').pop(),
			folder:	_filepath.substring(0,_filepath.length-fname.length),
			size:	0
		}
	}

	public getFolderInfoFromPath(_path:string,_subfolder:boolean=false):folderInfo {
		let l:uint=_path.length;
		let arr:fileInfo[]=[];
		for(let v of this.farr){
			if(v.path.substr(0,l)==_path){
				if(!_subfolder && v.path.substr(l+1).indexOf('/')>0){
					continue
				}
				arr.push(v)
			}
		}
		return {
			path:	_path,
			files:	arr
		}
	}
}