
export type rgb={
	r:uint,
	g:uint,
	b:uint,
	a:number
}

export function getRGB(num:uint):rgb{
	return {r:(num>>16) & 0xff,g:(num>>8) & 0xff,b:num & 0xff,a:1}
}

export function getRGBA(num:uint):rgb{
	return {r:(num>>16) & 0xff,g:(num>>8) & 0xff,b:num & 0xff,a:((num>>24) & 0xff)/255}
}

export function hashHexToNum(_s:string):uint{
	if(_s.substring(0,1)==='#'){
		return Number('0x'+_s.substring(1))
	}
	return Number('0x'+_s)
}
export function hashHexToUint8(_s:string):Uint8Array{
	let arr=[0,0,0,0];
	if(_s.length===6){
		arr=[
			parseInt('0x'+_s.substring(0,2)),
			parseInt('0x'+_s.substring(2,4)),
			parseInt('0x'+_s.substring(4,6)),
			255]
	}else if(_s.length===8){
		arr=[
			parseInt('0x'+_s.substring(0,2)),
			parseInt('0x'+_s.substring(2,4)),
			parseInt('0x'+_s.substring(4,6)),
			parseInt('0x'+_s.substring(6,8))
		]
	}
	let arr2=[];
	for(let i=0;i<256;i++){
		arr2.push(arr[0],arr[1],arr[2],arr[3])
	}
	return Uint8Array.from(arr2);
}
export function hashHexToRGBA(_s:string):rgb{
	let num=hashHexToNum(_s)
	if(num>0xffffff){
		getRGBA(num)
	}
	return getRGB(num)
}