import { sound,Sound } from '@pixi/sound';
import {Ticker} from 'pixi.js';
import { Cache } from 'pixi.js';

import {SoundType,SoundRemark} from './model/MCStructure';

export default class MCSound{
	static seVolume:number=1;
	static bgmVolume:number=1;
	static fileType=['','.mp3','.wav','.ogg','.webm'];

    static SoundType = SoundType;
	
	static seList:Sound[]=[];
	static currBgm?:Sound;
	static lastBgm?:Sound;
	static bgmFadeAcc:number=1;
	static bgmFadeTarget:number=1;

	static play(_soundRemark:SoundRemark,_basepath:string=''):Sound{
		for(const ft of MCSound.fileType){
			let filepath=_basepath+_soundRemark.soundFile+ft;
			if(Cache.has(filepath)){
			//if(Loader.shared.resources[filepath]){
				if(_soundRemark.type===SoundType.SoundEffect){
					return MCSound.playSE(filepath)
				}else if(_soundRemark.type===SoundType.BackgroundMusic){
					return MCSound.playBGM(filepath)
				}
			}
		}
		//
		let filepath=_basepath+_soundRemark.soundFile;
		if(_soundRemark.type===SoundType.BackgroundMusic){
			return MCSound.playBGM(filepath);
		}
		return MCSound.playSE(filepath);
	}


	static tickerAdded:boolean=false;
	static reuseKey:uint[]=[];
	static clearTimer:number=0;
	static initTicker(ticker?:Ticker){
		if(!ticker){
			ticker = Ticker.shared;
		}
		//ticker.add((delta:number)=>{
		ticker.add((ticker:Ticker)=>{
			const delta:number=ticker.deltaTime; //number
			MCSound.clearTimer+=delta
			if(MCSound.clearTimer>ticker!.FPS*5){
				MCSound.destroyEnded()
				MCSound.clearTimer=0;
			}
			//*fadein/out sound
			//bgmFadeAcc
		})
		MCSound.tickerAdded=true;
	}

	//bgm

	

	static playBGM(filepath:string):Sound{
		MCSound.stopBGM()
		MCSound.currBgm=Sound.from(filepath);
		MCSound.currBgm.volume=MCSound.bgmVolume;
		MCSound.currBgm.loop=true;
		MCSound.currBgm.play()
		return MCSound.currBgm;
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
		s.volume=MCSound.seVolume
		s.play();
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