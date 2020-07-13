# PixiJS MovieClip

Play Adobe Animate(Flash) MovieClip in PIXI using "export as texture alias" file format
shortened the name to 'MC'

Here is the demo result, convert from my friend's flash animation from long long time ago:
https://piximc.s3.amazonaws.com/demo/demo_scene.html
(only scene 5 have sound and script)

Using PIXI Sprite and Container implement, so you can control each child in movieclip as ordinary Display Object
Also you can adding timeline script and sound, changing scene , set the alpha, tint, brighness and filter in animate and just export to pixi
clone every child MC (or just Use the origin export MC as a library)

You can make the graphic and animation in animate and export it, adding script in javascript
(So why don't use Spine? Just because Spine don't brush, I like drawing and animation in same place)

## Code example

How to load a texture alias to pixi stage?
1) use 'MCLoader'(just like Loader in as3) load all files of the texture alias
2) return a 'MCModel' (just like swf file in flash) , contain multi 'MCSymbolModel' (just like Linkage MovieClip Class in as3), one for them is the main Symbol (the MovieClip you exported)
3) make 'MC' instance with the main Symbol Model

load the file and add to stage:

	var myFolderList=['media/cat/Animation.json','media/cat/spritemap1.json','media/cat/spritemap1.png','media/cat/meow.mp3']
	var myMcLoader = new PIXIMC.MCLoader(myFolderList, function (event) {

		//make instance
		var catMC = new PIXIMC.MC(event.model.mainSymbolModel);
		var catMC2 = (event.model).makeInstance();//shortcut

		app.stage.addChild(catMC);

		//make instance from MC's child
		var catHeadMC = new PIXIMC.MC(event.model.symbolList['cat_head']);
		catHeadMC.x=100;
		catMC.addChild(catHeadMC);//two head cat...

		//clone MC
		var catHeadMC2= new PIXIMC.MC(catHeadMC.MCSymbolModel);
		catHeadMC.addChild(catHeadMC2);//you can add a child inside same type of MC Model

		//after you loaded a MC, you can find the model by it's folder path :
		var catModel=MCLibrary.getInstance().get('media/cat/');
		var catMC3 = new PIXIMC.MC(catModel);
	})

You can use use node to run '.\scripts\tracefolder.js' to with folder '.\media\':

	node .\scripts\tracefolder.js .\media\

Then you will get a '.\media\files.txt', contains all files path in the folder with file size:

	dog/Animation.json	390872
	dog/spritemap1.json	422
	dog/spritemap1.png	111473
	cat/Animation.json	390872
	cat/spritemap1.json	422
	cat/spritemap1.png	111473
	cat/spritemap2.json	422
	cat/spritemap2.png	111473
	cat/meow.mp3		13958

You can use MCLoader load this text file:

	PIXIMC.FileList.getfolderInfoFromText('media/files.txt','media/', function (_data) { //textFilePath,targetFolder

		// a "folderInfo" object contains all files info in 'media/dog/'
		var myFolderList = PIXIMC.FileList.getInstance().getFolderInfoFromPath('media/dog/');
		var myMcLoader = new PIXIMC.MCLoader(myFolderList, function (event) {
			var dogMC = new PIXIMC.MC(event.model.mainSymbolModel);
		}

		var myFolderList2 = PIXIMC.FileList.getInstance().getFolderInfoFromPath('media/cat/');
		var myMcLoader2 = new PIXIMC.MCLoader(myFolderList2, function (event) {
			var catMC = new PIXIMC.MC(event.model.mainSymbolModel);
		}

	}

## Timeline

All MC have a timeline. you can use mc.timeline.stop, mc.timeline.gotoAndPlay(7) to play it like flash
But before that you have to init a MCPlayer first:

	PIXIMC.MCPlayer.initTicker(app.ticker);		//inital MCPlayer
	app.ticker.add(PIXIMC.TSound.soundTicker);	//optional
	PIXIMC.MCPlayer.getInstance().fps = 12;		//set to ftp to 12

Every MC will use PIXIMC.MCPlayer.getInstance() as the default player, but yoiu can change it on constructor

Changing frame will remove the children not in the new frame, but don't affert the child you addchild to a MC manually(and it will always on top)

p.s. you can change the play speed of timeline, but the frame sound and script may be fail...

	mc.timeline.speed=3.14


## fla example and setting

how to export texture:
In animate,open library, right click The MovieClip/Graphic you want to export , click 'Generate Texture Atlas...'

export setting:
**must tick "Optimize Animation.json file"**
**Resolution 1x only** - Adobe's bug, if export "bitmap" object but the resoultion not 1X, bitmap still display in 1X
not recommand image dimensions more then 2048 px
recommand 1px padding

filter:
Some fields in animate filter not support in pixi:
glow filter: 		BlueY(must lock X&Y)
drop shadow Filter:	BlurY, Inner shadow, knockout
Bevel Filter:		BlurX&Y(0), Type(inner only), knockout,Strength(fixed 100%)
Gradient Bevel Filter:	not support
Gradient glow filter:	not support
Adjust color filter: Hue,Brightness(please use brightness in color effect instead)

example:
https://piximc.s3.amazonaws.com/demo/demo_filter.html

## using function texture alias not provided

Here are some function you can't export from animate, but I have some replacement methods to impemtment them:
- add timeline script
- play sound on designated frame
- change scene
- blendmode


Remark object:
I made a demo "remark.fla" contain some remark object, just put them in the timeline and you can get the result.
- You set the arguments in instance name.
- The remark object will auto hide in the tuntime. (just like Guide layer's object)
- The Remark Object will only active in their first key frame.
- if you place any object in layer's name started with "remark_", the timeline will hide too(just like Guide layer). I suggest place all the remark object in layers as 'remark_script','remark_sound' etc

arguments:
"remark_gotoAndPlay" with instance name "$123" : gotoAndPlay(123)
"remark_gotoAndStop" with instance name "$label_init" : gotoAndStop('label_init')
"remark_blendMode" with instance name "multiply" : setting blend mode for the MC and all children in it (will auto cahnge to uppercase in runtime, see pixi's blendmode.)
"remark_sound" with instance name "se$047" : play sound "047.mp3" in the exported MC folder(auto replace to .mp3 to .wav if mp3  file is missing)
"remark_sound" with instance name "bgm$boss1" : play sound "boss1.mp3" with loop, auto stop if start play another "bgm"

"remark_stopAllSound,remark_play,remark_stop,remark_stopAtEnd" don't have argument
"remark_stopAtEnd" will auto stop the parent MovieClip at the end of timeline
"remark_stopAtEnd,remark_blendMode" don't care which frame you place it


Timeline script:
There are there way to add script on timeline.
1) myMC.timeline.addSCript(7,(_mc)=>{...}) // call on frame 7
2) myMC.timeline.addSCript('meet_first_boss',(_mc)=>{...}) // call on frame label
3) myMC.timeline.addSCript('meet_final_boss',(_mc)=>{...}) // call on with the fist frame "remark_script" instance with instance name "meet_final_boss" appear


Scene:
if your export a MovieClip with:
- just one frame
- all children instance name is 'scene1$sceneName'/'scene2' format
MCModel with detect it as a "MCScene" instead of "MC" Object, all children will become a scene and sort by the number in the instance name, and autoplay start from scene1
(all scene object postion will change to x:0,y:0)
You can use 'nextScene','gotoSceneAndStop' to change scene
MCScene don't have timeline, but you can use 'MCScene.sceneTimeline' to access the current scene MC's timeline


Soild color box:
If a mc instance named "solidcolorbox_{hexColorCode}",eg "solidcolorbox_99191A"
It will change to 1x1 pixel texture with that color

## TBC functions

layer effect
change skin
separate timeline in multi "actions" with remark object, and a "action player"

## License

MIT License.

This is my first typescript, pixijs, git (and markdown) project,
I may will write a better doc with all api later...