import {Matrix, Point} from '@pixi/math';

import {AsiModel} from './MCStructure';
import ASI from './ASI';
import MCDisplayObject from './MCDisplayObject';

export default class MCSprite extends MCDisplayObject {

    private _SN:string;
    public get SN():string{
        return this._SN;
    }

    private innerAsi:ASI;
    public get asi():ASI{
        return this.innerAsi;
    }

    constructor(_model:AsiModel,SN:string,spriteMatrix:Matrix){
        super();
        this.innerAsi=new ASI(_model);
        const newMat:Matrix=spriteMatrix.append(_model.matrix);
        this.innerAsi.transform.setFromMatrix(newMat);
        this.addChild(this.innerAsi);
        
		this._SN=SN;
        
    }

}