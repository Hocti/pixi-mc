import {Matrix,Rectangle} from '@pixi/math';;
import {Texture} from '@pixi/core';
import { DisplayObject } from '@pixi/display';
import MCModel from './MCModel'

//MC processed data structure

export type frameData={
	child:childData[],
	layer:layerData[]
}

export type childData={
	data?:rawInstenceData | rawAsiData,
	type:MCType,
	firstframe:uint,
	layer:uint,
	timeslot:uint
}

export type layerData={
	num:uint,
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
	zoom:number,
	matrix:Matrix,
	texture?:Texture
}

//remark===================

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
	frame_label?:string,
	args:string[]
}

export type GeomRemark={
	type:string,
	frame_begin:uint,
	frame_end:uint,
	args:string[],
	x:number,
	y:number,
	w?:number,
	h?:number,
	r?:number,
	rotate?:number
}

//RAW spriteSheet JSON===========================

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

//RAW animation JSON===========================

export type fullmodelData={
	AN:symbolModelData,//root symbol
	SD?:{//symbol library
		S:symbolModelData[]
	}
	MD:{
		FRT:number//file fps
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
		x:number,
		y:number
	},
	FF?:uint,
	LP?:LoopState,
	M3D:m3d,
	C?:colorData,
	F?:filterData
}

export enum MCType{
	MovieClip='MC',
	Button='B',
	Graphic='G',
	ASI='asi',//not in raw
	Sprite='Sprite'//not in raw
}

export type m3d=[number, ...Array<number>] & {length: 16};

export enum LoopState{
	Loop='LP',
	Once='PO',
	Stop='SF'
}

export type colorData={
	M:'CA' | 'AD' | 'T' | 'CBRT',

	BRT?:number,//brightness
	TC?:string,//tint hex
	TM?:number,//tint num

	RM:number,
	GM:number,
	BM:number,
	AM:number,
	RO:number,
	GO:number,
	BO:number,
	AO:number
};

export type filterData={
	BLF?:{
		BLX:number,
		BLY:number,
		Q:uint
	},
	GF?:{
		BLX:number,
		BLY:number,
		Q:uint,
		C:string,
		STR:number,
		KK:boolean,
		IN:boolean,
	},
	DSF?: {
		AL: number,
		BLX: number,
		BLY: number,
		C: string,
		A: number,
		DST: number,
		HO: boolean,
		IN: boolean,
		KK: boolean,
		Q: uint,
		STR: number,
	},
	BF?: {
		BLX: number,
		BLY: number,
		SC: string,
		SA: number,
		HC: string,
		HA: number,
		Q: uint,
		STR: number,
		KK: boolean,
		AL: number,
		DST: number,
		//TP: "inner"
	},
	ACF?: {
		BRT: number,
		CT: number,
		SAT: number,
		H: number
	}
};