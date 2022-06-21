import {Texture,BaseTexture} from '@pixi/core'
import {AsiModel} from './MCStructure';
import MCDisplayObject from './MCDisplayObject';

export default class ASI extends MCDisplayObject {

	public static MAX_SIDE:uint=2048;
	public static totalASI:uint=0;
	public model:AsiModel;

	constructor(_model:AsiModel,name?:string) {
		super(<Texture>_model.texture);
		ASI.makeTexture(_model)
		this.model=_model;
		if(name){
			this.name=name
		}
		ASI.totalASI++;
	}

	public static makeTexture(_model:AsiModel){
		if(!_model.texture){
			if(_model.rect.width>ASI.MAX_SIDE || _model.rect.height>ASI.MAX_SIDE){
				_model.texture=Texture.WHITE;
			}else{
				_model.texture=new Texture(new BaseTexture(_model.image),_model.rect)
			}
			if(_model.rotated){
				_model.texture.rotate=2;
			}
		}
	}
}