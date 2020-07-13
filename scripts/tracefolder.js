const fs=require('fs')
function traceFolder(_path){
	console.log(_path)
	if(_path.substr(-1)!='/'){
		_path+='/'
	}
	let full_arr=[];
	let arr=fs.readdirSync(_path,{withFileTypes:true})
	for(let v of arr){
		if(v.isDirectory()){
			full_arr.push(...traceFolder(_path+v.name))
		}else{
			full_arr.push(_path+v.name)
		}
	}
	return full_arr;
}
function filesText(_path){
	let l=_path.length+1
	let arr=traceFolder(_path)
	let content='';
	for(let k of arr){
		var stats = fs.statSync(k)
		content+=`${k.substr(l)}	${stats['size']}\n`;
	}
	return content;
}

if(process.argv[2]){
	console.log(process.argv[2])
	let content=filesText(process.argv[2]);

	//let filename=process.argv[2].replace(/[^\w\s]/gi, '')+'.list'
	let filename=process.argv[2]+'/files.txt'
	if(process.argv[3]){
		filename=process.argv[3];
	}
	fs.writeFile(filename,content,e=>true)
}