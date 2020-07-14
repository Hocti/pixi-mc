///

export type rgb={
	r:uint,
	g:uint,
	b:uint,
	a:float
}

export function getRGB(num:uint):rgb{
	return {r:(num>>16) & 0xff,g:(num>>8) & 0xff,b:num & 0xff,a:1}
}

export function getRGBA(num:uint):rgb{
	return {r:(num>>16) & 0xff,g:(num>>8) & 0xff,b:num & 0xff,a:((num>>24) & 0xff)/255}
}

export function hashHexToNum(_s:string):uint{
	if(_s.substr(0,1)=='#'){
		return Number('0x'+_s.substr(1))
	}
	return Number('0x'+_s)
}
export function hashHexToRGBA(_s:string):rgb{
	let num=hashHexToNum(_s)
	if(num>0xffffff){
		getRGBA(num)
	}
	return getRGB(num)
}