import {Matrix,Rectangle} from '@pixi/math';;
import {Texture} from '@pixi/core';
import { DisplayObject } from '@pixi/display';

import {MCType} from './MCType'
import MCModel from './MCModel'

//structure

export type layerData={
	name:string,
	C?:colorData,
	F?:filterData,
	isMask:boolean,
	maskBy?:string
}

export type AsiModel={
	rect:Rectangle,
	image:string,
	rotated:boolean,
	zoom:float,
	matrix:Matrix,
	texture?:Texture
}

//remark

export enum SoundType {
    SoundEffect='se',
    BackgroundMusic='bgm',
    BackgroundEffect='bge',
	stopAllSound='stopAllSound'
}

export type SoundRemark={
	type:SoundType,
	soundFile:string
}

export type PlayRemark={
	type:string,
	frame?:playTarget,
	frameLabel?:string,
	frameNumber?:number
}
export type playTarget=string | number


export type ScriptRemark={
	frame:uint,
	args:string[]
}
export type ExtraRemark={
	type:string,
	frame_begin:uint,
	frame_end:uint,
	args:string[]
}

export type GeomRemark={
	type:string,
	frame_begin:uint,
	frame_end:uint,
	args:string[],
	x:float,
	y:float,
	w?:float,
	h?:float,
	r?:float,
	rotate?:float
}


//


export type MCLoadedEvent={
	model:MCModel,
	content?:DisplayObject
}

export type FrameLabels=Dictionary<uint>;
export type FrameAction=string[];

//JSON type

export type frameData={
	child:childData[],
	/*
	sound:any[],
	*/
	layer:layerData[]
}

export type childData={
	data?:rawInstenceData | rawAsiData,
	type:MCType,
	firstframe:uint,
	layer:uint,
	timeslot:uint
}

export type spriteData={
	ATLAS:{
		SPRITES:rawSprite[]
	},
	meta:{
		app: string,
		version: string,
		image:string,
		format:string,
		size:{
			w:uint,
			h:uint,
		},
		resolution:string
	}
};

type rawSprite={
	SPRITE:{
		name: string,
		x: uint,
		y: uint,
		w: uint,
		h: uint,
		rotated: boolean
	}
}

export type fullmodelData={
	AN:symbolModelData,//root symbol
	SD?:{//symbol library
		S:symbolModelData[]
	}
	MD:{
		FRT:float//file fps
	}
};

export type symbolModelData={
	N?:string,//fla name
	SN:string,//symbol name
	TL:{//timeline
		L:rawlayerData[]
	}
}

type rawlayerData={
	LN:string,//layer name
	FR:rawframeData[],
	LT?:"Clp",//layer type: =mask
	Clpb?:string//mask parent layer
}

type rawframeData={
	I:uint,//start frame,min 0
	DU:uint,//frame duration,min 1
	E:rawframeElementData[],
	N?:string,//frame label 
	C?:colorData,
	F?:filterData,
}

type rawframeElementData={
	ASI?:rawAsiData,
	SI?:rawInstenceData
}

export type rawAsiData={
	N:string,
	M3D:m3d
}

export type rawInstenceData={
	SN:string,//symbolModelData's SN
	IN:string,//instance name
	ST:MCType,
	TRP:{//
		x:float,
		y:float
	},
	FF?:uint,
	LP?:LoopState,
	M3D:m3d,
	C?:colorData,
	F?:filterData
}

export type m3d=[float, ...Array<float>] & {length: 16};

export enum LoopState{
	Loop='LP',
	Once='PO',
	Stop='SF'
}

export type colorData={
	M:'CA' | 'AD' | 'T' | 'CBRT',

	BRT?:float,//brightness
	TC?:string,//tint hex
	TM?:float,//tint num

	RM:float,
	GM:float,
	BM:float,
	AM:float,
	RO:float,
	GO:float,
	BO:float,
	AO:float
};

export type filterData={
	BLF?:{
		BLX:float,
		BLY:float,
		Q:uint
	},
	GF?:{
		BLX:float,
		BLY:float,
		Q:uint,
		C:string,
		STR:float,
		KK:boolean,
		IN:boolean,
	},
	DSF?: {
		AL: float,
		BLX: float,
		BLY: float,
		C: string,
		A: float,
		DST: float,
		HO: boolean,
		IN: boolean,
		KK: boolean,
		Q: uint,
		STR: float,
	},
	BF?: {
		BLX: float,
		BLY: float,
		SC: string,
		SA: float,
		HC: string,
		HA: float,
		Q: uint,
		STR: float,
		KK: boolean,
		AL: float,
		DST: float,
		//TP: "inner"
	},
	ACF?: {
		BRT: float,
		CT: float,
		SAT: float,
		H: float
	}
};