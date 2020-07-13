///<reference path="../type_alias.d.ts"/>
import {MCType} from './MCType'
import MCModel from './MCModel'

type int=number;
type uint=number;
type float=number;

//structure

export type frameData={
	child:childData[],
	sound:any[],
	script:any[],
	timeline:any[],
	layer:layerData[]
}

export type childData={
	data:any,
	type:MCType,
	firstframe:uint,
	layer:uint,
	timeslot:uint
}

export type layerData={
	name:string,
	C:any,
	F:any,
	isMask:boolean,
	maskBy:string
}

export type AsiModel={
	rect:PIXI.Rectangle,
	image:string,
	rotated:boolean,
	zoom:float,
	texture?:PIXI.Texture,
	matrix?:PIXI.Matrix
}

export type remark={
	type:string,
	content?:string | string[] | number
}

export type scriptRemark={
	frame:uint,
	args:string[]
}

export type action={
	name:string,
	begin:uint,
	end:uint,
	phase:Dictionary<uint>
}

export type MCLoadedEvent={
	model:MCModel,
	content?:PIXI.DisplayObject
}


export type FrameLabels=Dictionary<uint>;
export type FrameAction=string[];