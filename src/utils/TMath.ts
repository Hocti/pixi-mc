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

export function m2dDetail(m:Matrix){
	return {
		x:m.tx,
		y:m.ty,
		scaleX:m.a,
		scaleY:m.d,
		rotate:0,
		skewX:0,
		skewY:0
	}
	/*
	TODO:
	rotate/skew
	*/
}