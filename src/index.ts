export * as MCStructure from './MC/MCStructure';

export {MCEffect,ColorMatrixAction,ColorChange,EffectGroup,EffectGroupAction,TintType} from './MC/MCEffect';
export {getTimer} from './utils/utils';
export {FileList,fileInfo,folderInfo} from './utils/FileList';
export * as TMath from './utils/TMath';

import MCDisplayObject from './MC/MCDisplayObject';
import ASI from './MC/ASI';
import MCLibrary from './MC/MCLibrary';
import MCLoader from './MC/MCLoader';
import MCModel from './MC/MCModel';
import MCSymbolModel from './MC/MCSymbolModel';
import MC from './MC/MC';
import MCScene from './MC/MCScene';
import MCPlayer from './MC/MCPlayer';
import MCTimeline from './MC/Timeline';
//import Timeline from './MC/MCTimeline';
import MCSound from './MC/MCSound';

export {
	MCDisplayObject,
	MCLoader,MCLibrary,
	MCSymbolModel,MCModel,
	MC,ASI,MCScene,
	MCTimeline,MCPlayer,
	MCSound
}

//extra===============================

import LabelMC,{LabelTimeline} from './extra/LabelMC';
import MCActor from './extra/MCActor';
import MCEX from './extra/MCEX';
import {MCReplacer} from './extra/MCReplacer';
export {
	LabelMC,LabelTimeline,
	MCEX,
	MCActor,
	MCReplacer
}