import MC from './MC';
import MCPlayer from './MCPlayer';
import MCSymbolModel from './MCSymbolModel';
import MCTimeline from './MCTimeline';
//import MCDisplayObject from './MCDisplayObject';
import MCDisplayObject from './MCDisplayObject';
import {timelineEventType} from './MCEvent';

export default class MCScene extends MCDisplayObject {

	private currSceneNum:number=1;
	private currSceneMC!:MC;
	private sceneMCList:MC[]=[];
	private _sceneName:string[]=[];

	public player:MCPlayer;
	private max_scene:number=1;

	constructor(model:MCSymbolModel,_player:MCPlayer=MCPlayer.getInstance()) {
		super();
		this.player=_player;
		if(model.mcModel.withScene && model.mcModel.mainSymbolModel===model){
			let allSceneMC=new MC(model,{player:_player});
			allSceneMC.showFrame(1);
			for(let c of allSceneMC.children ){
				let nameArr=(<MC>c).name.split('$');
				if(nameArr[0].substring(0,5)!='scene'){
					continue;
				}
				let scene_num=Number(nameArr[0].substring(5));
				this.max_scene=Math.max(this.max_scene,scene_num);
				if(nameArr[1]){
					this._sceneName[scene_num]=nameArr[1]
				}else{
					this._sceneName[scene_num]=nameArr[0];
				}
				this.sceneMCList[scene_num]=(<MC>c);
				(<MC>c).timeline.stop();
				(<MC>c).x=0;
				(<MC>c).y=0;
				(<MC>c).timeline.active=false;
				(<MC>c).isScene=true;
				//console.log('scene',scene_num,this._sceneName[scene_num])
			}
			for(let i=1;i<this.max_scene;i++){
				if(!this._sceneName[i]){
					console.error('not contain scene ',i,this.max_scene)
					return
				}
			}
			this.changeScene(1)
			this.sceneTimeline.play()
		}else{
			console.error('not a MCscene')
		}
	}

	protected destroyOption={
		children:true,texture:false
	}
	
	public destroy(){
		this.sceneMCList.forEach(scene => {
			scene.destroy()
		});
		super.destroy(this.destroyOption)
	}

	private getSceneNum(_scene:number|string):number{
		if(Number(_scene)>0){
			return Number(_scene);
		}else{
			return this.sceneName.indexOf(<string>_scene);
		}
	}

	public changeScene(_scene:number|string){
		this.currSceneNum=this.getSceneNum(_scene);
		let isPlaying:boolean=true;
		if(this.children.indexOf(this.currSceneMC)>=0){
			isPlaying=this.sceneTimeline.isPlaying;
			this.currSceneMC.timeline.active=false;
			this.removeChild(this.currSceneMC)
		}
		this.currSceneMC=this.sceneMCList[this.currSceneNum];
		if(!this.currSceneMC){
			console.error('not contain this scene:',_scene);
			return
		}
		this.addChild(this.currSceneMC)
		this.sceneTimeline.active=true;
		this.sceneTimeline.goto(1)
		this.currSceneMC.showFrame(1)

		this.emit(timelineEventType.sceneChange, {
			scene:this.currSceneNum,
			sceneName:this._sceneName[this.currSceneNum],
			mc:this.currSceneMC
		});
		
		if(isPlaying){
			this.sceneTimeline.play()
		}
	}

	public nextScene(){
		this.addScene(1)
	}

	public prevScene(){
		this.addScene(-1)
	}

	private addScene(_add:number){
		if(this.currSceneNum+_add<this.sceneName.length && this.currSceneNum+_add>0){
			this.changeScene(this.currSceneNum+_add)
		}
	}

	get sceneTimeline():MCTimeline{
		return this.currSceneMC.timeline;
	}

	get sceneName():string[]{
		return this._sceneName;
	}

	public gotoSceneAndPlay(_scene:string|number,_target:string|number):void{
		this.changeScene(_scene)
		this.sceneTimeline.gotoAndPlay(_target)
	}

	public gotoSceneAndStop(_scene:string|number,_target:string|number):void{
		this.changeScene(_scene)
		this.sceneTimeline.gotoAndStop(_target)
	}

	public getScene(_scene:string|number):MC{
		return this.sceneMCList[this.getSceneNum(_scene)];
	}

	static getParentSceneFromMC(_mc:MC):MCScene | undefined{
		if(_mc.isScene && _mc.parent instanceof MCScene){
			return _mc.parent;
		}
		return undefined
	}
}