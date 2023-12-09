/// <reference path="./global.d.ts" />
import './global.d.ts';

export {MCEffect,ColorMatrixAction,ColorChange,type EffectGroup,EffectGroupAction,TintType} from './MC/effect';

export * as TMath from './utils/TMath';

export {MCDisplayObject,ASI,MC,MCScene,MCSprite} from './MC/display';
export {MCPlayer,MCTimeline} from './MC/player';
export {MCLoader,MCLibrary,MCSymbolModel,MCModel,MCStructure} from './MC/model';

export {default as MCSound} from './MC/MCSound';

//extra===============================

import {MCReplacer} from './extra/MCReplacer';
import MCEX from './extra/MCEX';
import LabelMC from './extra/LabelMC';
import MCActor from './extra/MCActor';
import MCActorPlayer,{type ActorStep} from './extra/MCActorPlayer';
export {
	LabelMC,
	MCEX,
	MCActor,
	MCReplacer,
	MCActorPlayer,
	type ActorStep
}