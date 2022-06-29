export * as MCType from './MC/MCType';
export * as MCStructure from './MC/MCStructure';
export {timelineEventType} from './MC/MCEvent';

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


import LabelMC,{LabelTimeline} from './extra/LabelMC';

export {
	MCDisplayObject,
	MCLoader,MCLibrary,
	MCSymbolModel,MCModel,
	MC,ASI,MCScene,
	MCTimeline,MCPlayer,
	MCSound,
	LabelMC,LabelTimeline
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
export * from './utils/MCSound';
export {getTimer} from './utils/utils';
export * as TMath from './utils/TMath';

*/