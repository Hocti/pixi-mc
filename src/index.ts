import {MCEffect,effect,ColorChange,ColorMatrixAction} from './MC/MCEffect';
import * as MCType from './MC/MCType';
import * as MCStructure from './MC/MCStructure';
import MCDisplayObject from './MC/MCDisplayObject';

import {timelineEventType} from './MC/MCEvent';
import ASI from './MC/ASI';
import {FileList,fileInfo,folderInfo} from './utils/FileList';
import MCLibrary from './MC/MCLibrary';
import MCLoader from './MC/MCLoader';
import MCModel from './MC/MCModel';
import MCSymbolModel from './MC/MCSymbolModel';
import MC from './MC/MC';
import MCScene from './MC/MCScene';
import MCPlayer from './MC/MCPlayer';
import MCTimeline from './MC/Timeline';
import Timeline from './MC/MCTimeline';

import TSound from './utils/TSound';
import {getTimer} from './utils/utils';
import * as TMath from './utils/TMath';

export {
	FileList,MCLoader,MCLibrary,
	MCSymbolModel,MCModel,
	MC,ASI,MCScene,
	Timeline,MCTimeline,MCPlayer,timelineEventType,
	TSound,getTimer,TMath,
	MCEffect,ColorMatrixAction,ColorChange,effect,
	MCDisplayObject
}

/*
export {MCEffect,effect,ColorChange,ColorMatrixAction} from './MC/MCEffect';

//type enum
export * as MCType from './MC/MCType';
export * as MCStructure from './MC/MCStructure';
export {timelineEventType} from './MC/MCEvent';

export * from './MC/MCDisplayObject';
export * from './MC/ASI';
export * from './MC/MCLibrary';
export * from './MC/MCLoader';
export * from './MC/MCModel';
export * from './MC/MCSymbolModel';
export * from './MC/MC';
export * from './MC/MCScene';
export * from './MC/MCPlayer';
export * from './MC/Timeline';
export * from './MC/MCTimeline';


export {FileList,fileInfo,folderInfo} from './utils/FileList';
export * from './utils/TSound';
export {getTimer} from './utils/utils';
export * as TMath from './utils/TMath';

*/