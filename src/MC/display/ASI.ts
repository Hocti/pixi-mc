import {Texture,Assets} from 'pixi.js'
import {AsiModel} from '../model/MCStructure';
import MCDisplayObject from './MCDisplayObject'

//a pixi Sprite with preload texture support, constructor from a asi data model
export default class ASI extends MCDisplayObject {

	public static MAX_SIDE:uint=2048;
	public static totalASI:uint=0;

	private static textureCache:Record<string,Texture>={};
	//private static baseTextureCache:Record<string,BaseTexture>={};

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

	public async prepareTexture():Promise<boolean>{
		if(this.model.texture===undefined){
			await ASI.makeTexture(this.model)
			this.texture=<Texture>this.model.texture!;
			return true
		}
		return false
	}

	public static async makeTexture(model:AsiModel):Promise<Texture>{
		if(!model.texture){
			if(model.rect.width>ASI.MAX_SIDE || model.rect.height>ASI.MAX_SIDE){
				model.texture=Texture.WHITE;
			}else{
				const cacheName=`${model.image},${model.rect.x},${model.rect.y}`
				const texture:Texture= await Assets.load(model.image);
				const { frame } = texture;
				model.texture=new Texture({
					source: texture.source,
					label: cacheName,
					//orig:frame,//model.rect,
					frame:model.rect,
					//trim:frame,
					rotate: model.rotated?2:0,
				});
			}
				/*
				//console.log(model.image)
				if(!ASI.baseTextureCache[model.image]){
					//ASI.baseTextureCache[model.image]=new BaseTexture(model.image)
					const texture:Texture=await Assets.load(model.image)
					ASI.baseTextureCache[model.image]=texture;
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
			}*/
		}
		return model.texture!;
	}
}