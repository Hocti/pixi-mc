import { sound,Sound } from '@pixi/sound';
import {Ticker} from '@pixi/ticker';
import {Loader} from '@pixi/loaders';

import {SoundType,SoundRemark} from './MCStructure';

export default class MCSound{
	static seVolume:float=1;
	static bgmVolume:float=1;
	static fileType=['.mp3','.wav'];

    static SoundType = SoundType;
	
	static seList:Sound[]=[];
	static currBgm?:Sound;
	static lastBgm?:Sound;
	static bgmFadeAcc:float=1;
	static bgmFadeTarget:float=1;

	static play(_soundRemark:SoundRemark,_basepath:string=''){
		for(const ft of MCSound.fileType){
			let filepath=_basepath+_soundRemark.soundFile+ft;
			if(Loader.shared.resources[filepath]){
				if(_soundRemark.type===SoundType.SoundEffect){
					MCSound.playSE(filepath)
				}else if(_soundRemark.type===SoundType.BackgroundMusic){
					MCSound.playBGM(filepath)
				}
				//*remove after played?
			}
		}
	}

	static reuseKey:int[]=[];
	static clearTimer:float=0;
	static initTicker(ticker:Ticker){
		ticker.add((delta:float)=>{
			MCSound.clearTimer+=delta
			if(MCSound.clearTimer>60*5){
				MCSound.destroyEnded()
				MCSound.clearTimer=0;
			}
			//*fadein/out sound
			//bgmFadeAcc
		})
	}

	//bgm

	

	static playBGM(filepath:string){
		MCSound.stopBGM()
		MCSound.currBgm=Sound.from(filepath);
		MCSound.currBgm.volume=MCSound.bgmVolume;
		MCSound.currBgm.loop=true;
		MCSound.currBgm.play()
		//*fade in/out
	}

	static stopBGM(){
		if(MCSound.currBgm){
			MCSound.currBgm.stop();
			MCSound.currBgm.destroy();
			MCSound.currBgm=undefined;
		}
	}

	//se

	static playSE(filepath:string):Sound{
		let s=Sound.from(filepath);
		if(MCSound.reuseKey.length>0){
			MCSound.seList[MCSound.reuseKey.shift()!]=s;
		}else{
			MCSound.seList.push(s);
		}
		s.play();
		s.volume=MCSound.seVolume
		return s;
	}

	static destroyEnded(){
		for(let k in MCSound.seList){
			if(!MCSound.seList[k].isPlaying){
				MCSound.seList[k].destroy();
				delete MCSound.seList[k];
				MCSound.reuseKey.push(Number(k));
			}
		}
	}

	static stopAllSE(){
		for(let k of MCSound.seList){
			if(k){
				k.stop();
				k.destroy();
			}
		}
		MCSound.reuseKey=[];
		MCSound.seList=[];
	}

	//all sound

	static stopAllSound(){
		MCSound.stopAllSE()
		MCSound.stopBGM()

		sound.stopAll();
		sound.removeAll();
	}

	static pauseAll(){
		for(let k of MCSound.seList){
			if(k){
				k.pause();
			}
		}
		if(MCSound.currBgm){
			MCSound.currBgm.pause();
		}
	}

	static resumeAll(){
		for(let k of MCSound.seList){
			if(k && k.paused){
				k.play();
			}
		}
		if(MCSound.currBgm){
			MCSound.currBgm.resume();
		}
	}
}

/**
 * to do:
 * background se
 * face in/out next bgm
 * left right,volume
*/