//export * as MCStructure from './MC/model/MCStructure';

export {MCEffect,ColorMatrixAction,ColorChange,EffectGroup,EffectGroupAction,TintType} from './MC/effect';
export {getTimer} from './utils/utils';
export {FileList,fileInfo,folderInfo} from './utils/FileList';
export * as TMath from './utils/TMath';

export {MCDisplayObject,ASI,MC,MCScene,MCSprite} from './MC/display';
export {MCPlayer,MCTimeline} from './MC/player';
export {MCLoader,MCLibrary,MCSymbolModel,MCModel,MCStructure} from './MC/model';

//import Timeline from './MC/MCTimeline';
//import MCSound from './MC/MCSound';

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