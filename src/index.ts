/// <reference path="../global.d.ts" />

export {MCEffect,ColorMatrixAction,ColorChange,type EffectGroup,EffectGroupAction,TintType} from './MC/effect';
export {getTimer} from './utils/utils';
export {FileList,type fileInfo,type folderInfo} from './utils/FileList';
export * as TMath from './utils/TMath';

export {MCDisplayObject,ASI,MC,MCScene,MCSprite} from './MC/display';
export {MCPlayer,MCTimeline} from './MC/player';
export {MCLoader,MCLibrary,MCSymbolModel,MCModel,MCStructure} from './MC/model';

//export * as MCStructure from './MC/model/MCStructure';
//import MCSound from './MC/MCSound';

//extra===============================

import LabelMC from './extra/LabelMC';
import MCActor from './extra/MCActor';
import MCEX from './extra/MCEX';
import {MCReplacer} from './extra/MCReplacer';
export {
	LabelMC,
	MCEX,
	MCActor,
	MCReplacer
}