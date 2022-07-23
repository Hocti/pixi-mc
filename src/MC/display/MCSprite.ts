import {Matrix, Point} from '@pixi/math';
import {BLEND_MODES} from '@pixi/constants';

import ASI from './ASI';
import MCDisplayObject from './MCDisplayObject';
import {MCEffect,type EffectGroup,EffectGroupAction} from '../effect'
import {MCType,AsiModel} from '../model/MCStructure';
import MCSymbolModel from '../model/MCSymbolModel';
import type IMCSprite from './IMCSprite';

export default class MCSprite extends MCDisplayObject implements IMCSprite{

    /*
    private _SN:string;
    public get SN():string{
        return this._SN;
    }
    */

    private innerAsi:ASI;
    public get asi():ASI{
        return this.innerAsi;
    }

    public spriteMatrix?:Matrix;
	
    private _symbolModel:MCSymbolModel;
	public get symbolModel():MCSymbolModel{
		return this._symbolModel
	}

	public readonly type:MCType=MCType.Sprite;

    constructor(sm:MCSymbolModel){
        super();
        this._symbolModel=sm;

        this.innerAsi=new ASI(sm.spriteModel!);
        this.innerAsi.transform.setFromMatrix(sm.spriteMatrix!.clone().append(sm.spriteModel!.matrix));
        this.addChild(this.innerAsi);

        this.innerAsi.blendMode=sm.defaultBlendMode
    }
    
	public showEffect():void{
		super.showEffect();
        this.innerAsi.blendMode=this.blendMode
	}
}