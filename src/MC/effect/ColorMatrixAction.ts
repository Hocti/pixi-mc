import { ColorMatrix} from '@pixi/filter-color-matrix';

import * as Color from '../../utils/color';
import * as TMath from '../../utils/TMath';

const DELTA_INDEX:number[] = [
	0,    0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1,  0.11,
	0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
	0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
	0.44, 0.46, 0.48, 0.5,  0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 
	0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
	1.0,  1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
	1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0,  2.12, 2.25, 
	2.37, 2.50, 2.62, 2.75, 2.87, 3.0,  3.2,  3.4,  3.6,  3.8,
	4.0,  4.3,  4.7,  4.9,  5.0,  5.5,  6.0,  6.5,  6.8,  7.0,
	7.3,  7.5,  7.8,  8.0,  8.4,  8.7,  9.0,  9.4,  9.6,  9.8, 
	10.0
];


export default class ColorMatrixAction{
	
	public static create():ColorMatrix{
		return [
			1, 0, 0, 0, 0,
			0, 1, 0, 0, 0,
			0, 0, 1, 0, 0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
	}
	
	public static clone(p1:ColorMatrix):ColorMatrix{
		let newArr:number[]=[];
		for(let i=0;i<=19;i++){
			newArr[i]=p1[i];
		}
		return newArr as ColorMatrix;
	}

	public static multiply(_p1:ColorMatrix,_p2:ColorMatrix):ColorMatrix {
		let p1:number[]=[..._p1,0, 0, 0, 0, 1]
		let p2:number[]=[..._p2,0, 0, 0, 0, 1]

		let col:number[] = [];
		//let rem=ColorMatrixAction.clone(p1)
		for (let i:number=0;i<5;i++) {
			for (let j:number=0;j<5;j++) {
				col[j] = p1[j+i*5];
			}
			for (let j:number=0;j<5;j++) {
				let val:number=0;
				for (let k:number=0;k<5;k++) {
					val += p2[j+k*5]*col[k];
				}
				p1[j+i*5] = val;
			}
		}
		return p1.slice(0, 20) as ColorMatrix;
	}

	
	public static tintOver(_color:string | uint):ColorMatrix{
		let rgb=Color.getRGB(Color.hashHexToNum(String(_color)));
		let cmatrix:ColorMatrix=[
			0,1,0,0,rgb.r/255,
			0,1,0,0,rgb.g/255,
			0,1,0,0,rgb.b/255,
			0, 0, 0, 1, 0,
			//0,0,0, 0, 1
		];
		return ColorMatrixAction.multiply(cmatrix,ColorMatrixAction.saturation(-100));
	}

	public static tint(_color:string | uint,m:number=1):ColorMatrix{
		let rgb=Color.getRGB(Color.hashHexToNum(String(_color)));
		let cmatrix:ColorMatrix=[
			1-m, 0, 0, 0, rgb.r*m/255,
			0, 1-m, 0, 0, rgb.g*m/255,
			0, 0, 1-m, 0, rgb.b*m/255,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}
	
	public static flashBrightness(b:number):ColorMatrix{
		if(!Number(b)){
			return ColorMatrixAction.create();
		}
		if(b>0){
			return [
				1-b, 0, 0, 0, b,
				0, 1-b, 0, 0, b,
				0, 0, 1-b, 0, b,
				0, 0, 0, 1, 0,
				//0, 0, 0, 0, 1
			];
		}
		return [
			1+b, 0, 0, 0, 0,
			0, 1+b, 0, 0, 0,
			0, 0, 1+b, 0, 0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
	}

	public static set4(_brightness:number=0,_hue:number=0,_saturation:number=0,_contrast:number=0):ColorMatrix{
		let m=ColorMatrixAction.create();
		if(_brightness!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.brightness(_brightness))
		}
		if(_hue!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.hue(_hue))
		}
		if(_saturation!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.saturation(_saturation))
		}
		if(_contrast!=0){
			m=ColorMatrixAction.multiply(m,ColorMatrixAction.contrast(_contrast))
		}
		return m;
	}

	public static brightness(b:number):ColorMatrix{
		if(!Number(b)){
			return ColorMatrixAction.create();
		}
		let cmatrix:ColorMatrix=[
			1, 0, 0, 0, b,
			0, 1, 0, 0, b,
			0, 0, 1, 0, b,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

	public static hue(p_val:number=1 ):ColorMatrix{
		if(!Number(p_val)){
			return ColorMatrixAction.create();
		}
		p_val = TMath.cleanValue(p_val,180)/180*Math.PI;
		let cosVal:number = Math.cos(p_val);
		let sinVal:number = Math.sin(p_val);
		let lumR:number = 0.213;
		let lumG:number = 0.715;
		let lumB:number = 0.072;
		let cmatrix:ColorMatrix=[
			lumR+cosVal*(1-lumR)+sinVal*(-lumR),lumG+cosVal*(-lumG)+sinVal*(-lumG),lumB+cosVal*(-lumB)+sinVal*(1-lumB),0,0,
			lumR+cosVal*(-lumR)+sinVal*(0.143),lumG+cosVal*(1-lumG)+sinVal*(0.140),lumB+cosVal*(-lumB)+sinVal*(-0.283),0,0,
			lumR+cosVal*(-lumR)+sinVal*(-(1-lumR)),lumG+cosVal*(-lumG)+sinVal*(lumG),lumB+cosVal*(1-lumB)+sinVal*(lumB),0,0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

	public static saturation(p_val:number=0):ColorMatrix{
		if(!Number(p_val)){
			return ColorMatrixAction.create();
		}
		p_val = TMath.cleanValue(p_val,100)
		let x:number = 1+((p_val > 0) ? 3*p_val/100 : p_val/100);
		let lumR:number = 0.3086;
		let lumG:number = 0.6094;
		let lumB:number = 0.0820;
		let cmatrix:ColorMatrix=[
			lumR*(1-x)+x,lumG*(1-x),lumB*(1-x),0,0,
			lumR*(1-x),lumG*(1-x)+x,lumB*(1-x),0,0,
			lumR*(1-x),lumG*(1-x),lumB*(1-x)+x,0,0,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

	public static contrast(p_val:number=0):ColorMatrix{//-100~100
		if(!Number(p_val)){
			return ColorMatrixAction.create();
		}

		p_val = TMath.cleanValue(p_val,100)
		
		let x:number;
		if (p_val<0) {
			x = 50+p_val/100*50
		} else {
			x = p_val%1;
			if (x === 0) {
				x = DELTA_INDEX[p_val];
			} else {
				x = DELTA_INDEX[(p_val<<0)]*(1-x)+DELTA_INDEX[(p_val<<0)+1]*x;
				// use linear interpolation for more granularity.
			}
			x = x*50+50;
		}
		let cmatrix:ColorMatrix=[
			x/50,0,0,0,0.5*(50-x)/100,
			0,x/50,0,0,0.5*(50-x)/100,
			0,0,x/50,0,0.5*(50-x)/100,
			0, 0, 0, 1, 0,
			//0, 0, 0, 0, 1
		];
		return cmatrix;
	}

}
