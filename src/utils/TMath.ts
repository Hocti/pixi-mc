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

export const degree:float = 180 / Math.PI;
export const radian:float = Math.PI / 180;



export function m2dDetail(m:Matrix){
	
	let scaleX:float = Math.sign(m.a)*Math.sqrt(m.a * m.a + m.b * m.b);
	let scaleY:float = Math.sign(m.d)*Math.sqrt(m.c * m.c + m.d * m.d);
	let rotation:float = Math.atan2(m.c,m.d);
	//let skewX:float=0;
	//let skewY:float=0;

	/*
	const delta = m.a * m.d - m.b * m.c;
	if (m.a != 0 || m.b != 0) {
		const r = Math.sign(m.a)*Math.sqrt(m.a * m.a + m.b * m.b);
		rotation = m.b > 0 ? Math.acos(m.a / r) : -Math.acos(m.a / r);
		scaleX = r;
		scaleY = delta / r;
		//skewX = Math.atan((m.a * m.c + m.b * m.d) / (r * r))
		//skewY = 0
	  } else if (m.c != 0 || m.d != 0) {
		const s = Math.sqrt(m.c * m.c + m.d * m.d);
		rotation = Math.PI / 2 - (m.d > 0 ? Math.acos(-m.c / s) : -Math.acos(m.c / s));
		scaleX =delta / s
		scaleY=s;
		//skewX = 0
		//skewY=Math.atan((m.a * m.c + m.b * m.d) / (s * s));
	  }
	  */

	return {
		x:m.tx,
		y:m.ty,
		scaleX,
		scaleY,
		//rotation:rotation * degree,
		rotation,
		//rotationInDegree:rotation * degree,
		//skewX:skewX*degree,
		//skewY:skewY*degree
	}
}