import type IMCSprite from './IMCSprite';
import MCDisplayObject from './MCDisplayObject';
export interface ImultiMC extends MCDisplayObject{
	currentMC?:IMCSprite;
}

export function instanceOfImultiMC(object: MCDisplayObject): object is ImultiMC {
	return 'currentMC' in object;
}
