import {Matrix} from '@pixi/math';


export function clamp(input:number,min:number,max:number):number{
	return Math.min(Math.max(input,min),max)
}
export function cleanValue(p_val:number,p_limit:number):number {
	return clamp(p_val,-p_limit,p_limit);
}

export const degree:number = 180 / Math.PI;
export const radian:number = Math.PI / 180;




export function m3dto2d(a:number[]):Matrix{
	return new Matrix(a[0],a[1],a[4],a[5],a[12],a[13])
}

export function compose2DMatrixWithoutSkew(scaleX:number,scaleY?:number,rotate:number=0,x:number=0,y:number=0):Matrix{
	if(scaleY===undefined){
		scaleY=Math.abs(scaleX)
	}
	const m=new Matrix(scaleX,0,0,scaleY,x,y);
	return m.rotate(rotate*radian);
}

/**
 * Composes a 2D transformation matrix from given components: translation (x, y),
 * scale (scaleX, scaleY), rotation, and skew (skewX, skewY).
 *
 * @param {number} x - Translation along the x-axis.
 * @param {number} y - Translation along the y-axis.
 * @param {number} scaleX - Scale along the x-axis.
 * @param {number} scaleY - Scale along the y-axis.
 * @param {number} rotation - Rotation in radians.
 * @param {number} skewX - Skew along the x-axis in radians.
 * @param {number} skewY - Skew along the y-axis in radians.
 * @returns {Matrix} - The composed 2D transformation matrix.
 */
export function compose2DMatrix( scaleX: number=1, scaleY?: number, rotation: number=0, x: number=0, y: number=0, skewX: number=0, skewY: number=0): Matrix {
	
	if(scaleY===undefined){
		scaleY=Math.abs(scaleX)
	}

    // Create a new matrix
    let matrix = new Matrix();

    // Apply rotation and skew
    matrix.a = Math.cos(rotation + skewY) * scaleX;
    matrix.b = Math.sin(rotation + skewY) * scaleX;
    matrix.c = -Math.sin(rotation - skewX) * scaleY;
    matrix.d = Math.cos(rotation - skewX) * scaleY;

    // Apply translation
    matrix.tx = x;
    matrix.ty = y;

    return matrix;
}


/**
 * Decomposes a 2D transformation matrix into its components: translation (x, y),
 * scale (scaleX, scaleY), rotation, and skew (skewX, skewY).
 *
 * @param {Matrix} m - The 2D matrix represented as an array of 9 numbers.
 * @returns An object containing the decomposed values of the matrix.
 */
export function decompose2DMatrix(m: Matrix) {
    // Calculate scale values
    let scaleX: number = Math.sign(m.a) * Math.sqrt(m.a * m.a + m.b * m.b);
    let scaleY: number = Math.sign(m.d) * Math.sqrt(m.c * m.c + m.d * m.d);

    // Calculate rotation in radians
    let rotation: number = Math.atan2(m.c, m.d);

    // Calculate skew values
    let skewX: number = Math.atan2(-m.b, m.a);
    let skewY: number = Math.atan2(m.c, m.d);

    return {
        x: m.tx,        // Translation x
        y: m.ty,        // Translation y
        scaleX,         // Scale x
        scaleY,         // Scale y
        rotation,       // Rotation in radians
        skewX,          // Skew x in radians
        skewY           // Skew y in radians
    };
}