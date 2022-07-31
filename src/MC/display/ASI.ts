import {Texture,BaseTexture} from '@pixi/core'
import {AsiModel} from '../model/MCStructure';
import MCDisplayObject from './MCDisplayObject';
//import { Sprite } from '@pixi/sprite';

export default class ASI extends MCDisplayObject {

	public static MAX_SIDE:uint=2048;
	public static totalASI:uint=0;

	/*publicReadonly*/ public model:AsiModel;

	constructor(model:AsiModel) {
		super();
		this.model=model;
		if(this.model.texture!==undefined){
			this.texture=<Texture>this.model.texture;
		}else{
			//this.prepareTexture()
			this.on('added',this.prepareTexture)
		}
		ASI.totalASI++;
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

	public static makeTexture(model:AsiModel):Texture{
		if(!model.texture){
			if(model.rect.width>ASI.MAX_SIDE || model.rect.height>ASI.MAX_SIDE){
				model.texture=Texture.WHITE;
			}else{
				//console.log(model.image)
				if(!ASI.baseTextureCache[model.image]){
					ASI.baseTextureCache[model.image]=new BaseTexture(model.image)
				}
				const cacheName=`${model.image},${model.rect.x},${model.rect.y}`
				if(!ASI.textureCache[cacheName]){
					model.texture=ASI.textureCache[cacheName]=new Texture(ASI.baseTextureCache[model.image],model.rect)
				}else{
					model.texture=ASI.textureCache[cacheName]
				}
				
				//model.texture=new Texture(new BaseTexture(model.image),model.rect)
			}
			if(model.rotated){
				model.texture.rotate=2;
			}
		}
		return model.texture!;
	}
}