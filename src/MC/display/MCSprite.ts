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
    public SN:string;
    public spriteMatrix?:Matrix;
    */

    /*publicReadonly*/ public asi:ASI;
    /*publicReadonly*/ public symbolModel:MCSymbolModel;
	/*publicReadonly*/ public type:MCType=MCType.Sprite;

	


    constructor(sm:MCSymbolModel){
        super();
        this.symbolModel=sm;

        this.asi=new ASI(sm.spriteModel!);
        this.asi.transform.setFromMatrix(sm.spriteMatrix!.clone().append(sm.spriteModel!.matrix));
        this.addChild(this.asi);

        this.asi.blendMode=sm.defaultBlendMode
    }
    
	public showEffect():void{
		super.showEffect();
        this.asi.blendMode=this.blendMode
	}
}