import {Texture,BaseTexture} from '@pixi/core'
import {AsiModel} from './MCStructure';
import MCDisplayObject from './MCDisplayObject';

export default class ASI extends MCDisplayObject {

	public static MAX_SIDE:uint=2048;
	public static totalASI:uint=0;
	public model:AsiModel;

	constructor(_model:AsiModel,name?:string) {
		super();
		this.model=_model;
		if(name){
			this.name=name
		}
		if(this.model.texture!==undefined){
			this.texture=<Texture>this.model.texture;
		}else{
			//this.prepareTexture()
			this.on('added',this.prepareTexture)
		}
		ASI.totalASI++;
	}

	public prepareTexture(){
		if(this.model.texture===undefined){
			ASI.makeTexture(this.model)
			this.texture=<Texture>this.model.texture!;
		}
	}

	private static textureCache:Dictionary<Texture>={};
	private static baseTextureCache:Dictionary<BaseTexture>={};

	public static makeTexture(_model:AsiModel){
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
	}
}