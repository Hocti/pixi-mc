///

export function m3dto2d(a:number[]):PIXI.Matrix{
	return new PIXI.Matrix(a[0],a[1],a[4],a[5],a[12],a[13])
}
export function clamp(input:number,min:number,max:number):number{
	return Math.min(Math.max(input,min),max)
}