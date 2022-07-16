import {Matrix, Point} from '@pixi/math';
import {BLEND_MODES} from '@pixi/constants';

import {AsiModel} from './MCStructure';
import ASI from './ASI';
import MCDisplayObject from './MCDisplayObject';
import {MCEffect,EffectGroup,EffectGroupAction} from './MCEffect'

export default class MCSprite extends MCDisplayObject {

    private _SN:string;
    public get SN():string{
        return this._SN;
    }

    private innerAsi:ASI;
    public get asi():ASI{
        return this.innerAsi;
    }

    public spriteMatrix?:Matrix;

    constructor(_model:AsiModel,SN:string,spriteMatrix:Matrix,blendMode:BLEND_MODES=0){
        super();
        this.innerAsi=new ASI(_model);
        this.innerAsi.transform.setFromMatrix(spriteMatrix.clone().append(_model.matrix));
        this.addChild(this.innerAsi);
		this._SN=SN;

        this.innerAsi.blendMode=blendMode
    }
    
    /*
	public showEffect():EffectGroup{
		const eg:EffectGroup=super.showEffect();
        this.innerAsi.blendMode=eg.blendMode
        return eg
	}
    */
}