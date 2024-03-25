import ASI from './ASI';
import MCDisplayObject from './MCDisplayObject';
import {MCType,AsiModel} from '../model/MCStructure';
import MCSymbolModel from '../model/MCSymbolModel';
import type IMCSprite from './IMCSprite';

//a Sprite onlu contain one ASI,with effect and blendMode support
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
        //this.asi.transform.setFromMatrix(sm.spriteMatrix!.clone().append(sm.spriteModel!.matrix));
        const newMatrix=sm.spriteMatrix!.clone().append(sm.spriteModel!.matrix);
        this.asi.setFromMatrix(newMatrix);
        
        this.addChild(this.asi);

        this.asi.blendMode=sm.defaultBlendMode
    }
    
	public showEffect():void{
		super.showEffect();
        this.asi.blendMode=this.blendMode
	}
}