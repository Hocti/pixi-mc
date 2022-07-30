import {Texture,BaseTexture} from '@pixi/core'
import {AsiModel} from '../model/MCStructure';
import MCDisplayObject from './MCDisplayObject';
//import { Sprite } from '@pixi/sprite';

export default class ASI extends MCDisplayObject {

	public static MAX_SIDE:uint=2048;
	public static totalASI:uint=0;
	private _model:AsiModel;

	constructor(_model:AsiModel) {
		super();
		this._model=_model;
		if(this.model.texture!==undefined){
			this.texture=<Texture>this.model.texture;
		}else{
			//this.prepareTexture()
			this.on('added',this.prepareTexture)
		}
		ASI.totalASI++;
	}

	public get model():AsiModel{
		return this._model;
	}

	public prepareTexture():boolean{
		if(this.model.texture===undefined){
			ASI.makeTexture(this.model)
			this.texture=<Texture>this.model.texture!;
			return true
		}
		return false
	}

	private static textureCache:Record<string,Texture>={};
	private static baseTextureCache:Record<string,BaseTexture>={};

	public static makeTexture(_model:AsiModel):Texture{
		if(!_model.texture){
			if(_model.rect.width>ASI.MAX_SIDE || _model.rect.height>ASI.MAX_SIDE){
				_model.texture=Texture.WHITE;
			}else{
				//console.log(_model.image)
				if(!ASI.baseTextureCache[_model.image]){
					ASI.baseTextureCache[_model.image]=new BaseTexture(_model.image)
				}
				const cacheName=`${_model.image},${_model.rect.x},${_model.rect.y}`
				if(!ASI.textureCache[cacheName]){
					_model.texture=ASI.textureCache[cacheName]=new Texture(ASI.baseTextureCache[_model.image],_model.rect)
				}else{
					_model.texture=ASI.textureCache[cacheName]
				}
				
				//_model.texture=new Texture(new BaseTexture(_model.image),_model.rect)
			}
			if(_model.rotated){
				_model.texture.rotate=2;
			}
		}
		return _model.texture!;
	}
}