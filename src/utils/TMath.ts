import {Matrix} from '@pixi/math';


export function m3dto2d(a:float[]):Matrix{
	return new Matrix(a[0],a[1],a[4],a[5],a[12],a[13])
}
export function clamp(input:float,min:float,max:float):float{
	return Math.min(Math.max(input,min),max)
}
export function cleanValue(p_val:float,p_limit:float):float {
	return clamp(p_val,-p_limit,p_limit);
}