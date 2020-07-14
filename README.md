# PixiJS MovieClip

Play Adobe Animate(Flash) MovieClip in PIXI, using "generate texture atlas ..." file format.

Here is the demo result, converted from my friend's flash animation from long long time ago:
https://piximc.s3.amazonaws.com/demo/demo_scene.html  
(Only scene 5 has sounds and scripts.)

Using PIXI Sprite and Container implementation, you can control each child in the MovieClip as an ordinary DisplayObject.
Also, you can add script and sound on designated frame, changing scene, set the alpha, tint, brightness and filter in Adobe Animate, and export to pixi
Or just Use the origin export file as a library, attach MC's children to stage manually.

You can create graphics and animations in Adobe Animate and export them, adding script in javascript
(So why don't use Spine? Because Spine doesn’t have pencil and brush. I like drawing and making animation at the same place, exspecially Stickman animation.)

## How to Use

	npm install
	npm run build

Then you will get PIXIMC.js in "./dist/".  
Load it in html after loaded 'pixi' , 'pixi-sound' , 'pixi-filter'.

## Code example

How to load texture atlas files and make a MC instance in pixi?
- use 'MCLoader'(just like Loader in AS3) to load all texture atlas files
- return a 'MCModel' (just like swf file in flash)
	- contain multi 'MCSymbolModel' (just like Linkage MovieClip Class in AS3)
	- one of them is the main Symbol (the MovieClip you exported)
- make 'MC' instance from main Symbol Model

### Load the files and add to stage:

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

		var catHeadMC2= event.model.makeInstance('cat_head')
		catHeadMC2.x=-100;
		catMC.addChild(catHeadMC2);//three head cat...

		//clone MC
		var catHeadMC3= new PIXIMC.MC(catHeadMC.MCSymbolModel);
		catHeadMC.addChild(catHeadMC3);//you can add a child inside same type of MC Model

		//after you loaded a MC, you can find the model by it's folder path :
		var catModel=MCLibrary.getInstance().get('media/cat/');
		var catMC3 = new PIXIMC.MC(catModel);
	})

You can use run '.\scripts\tracefolder.js' with nodejs, to generate folder listing file of '.\media\':

	node .\scripts\tracefolder.js .\media\

Then you will get a '.\media\files.txt', contains all files paths in the folder with file sizes:

	dog/Animation.json	390872
	dog/spritemap1.json	422
	dog/spritemap1.png	111473
	cat/Animation.json	390872
	cat/spritemap1.json	422
	cat/spritemap1.png	111473
	cat/spritemap2.json	422
	cat/spritemap2.png	111473
	cat/meow.mp3		13958

You can use MCLoader to load this file:

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

for every folders in '.\media\' , you can load all sub files by providing the folder path.

Add to Stage before load done:

	var myMcLoaderContainer = new PIXIMC.MCLoader.loadContainer(['media/FilterDemo/Animation.json','media/FilterDemo/spritemap1.json','media/FilterDemo/spritemap1.png'], function (event) {
		//loadContainer is a PIXI.Container, after the MC loaded, with addChild to the loadContainer automaticlly, just like Loader in AS3.
	});
	myMcLoaderContainer.x=400;
	app.stage.addChild(myMcLoaderContainer);

## Timeline

All MC have a timeline. You can use myMC.timeline.stop(), myMC.timeline.gotoAndPlay(7) to play it like what AS3 does.

But before that you have to init 'MCPlayer' first:

	PIXIMC.MCPlayer.initTicker(app.ticker);		//inital MCPlayer
	app.ticker.add(PIXIMC.TSound.soundTicker);	//optional
	PIXIMC.TSound.initTicker(app.ticker);		//optional
	PIXIMC.MCPlayer.getInstance().fps = 24;		//set to ftp to 12

Every MC uses "PIXIMC.MCPlayer.getInstance()" as the default player, but you can change it manually.

Changing frame will remove the children not in the new frame, but doesn't affert the children you added to the MC manually (and they will always on top.)

Note: you can change the playing speed of every timeline, but the frame sound and script may not be triggered.

	mc.timeline.speed=1.75


## fla example and setting

How to export texture:
In Adobe Animate,open library, right click The MovieClipc you want to export , click 'Generate Texture Atlas...'

### Export setting:
- **must tick "Optimize Animation.json file"**
- **Resolution 1x only** - Adobe's bug. If you export some "bitmap" object but the resoultion is not 1x, bitmap still export at 1x.
- Image dimensions more then 2048 pixels not recommended
- 1px padding recommended
- sometimes multi objects contained in single frame MC will group in one single bitmap, to avoid this , please extend timeline to two frames

### Filter:
Some fields in Adobe Animate filter not supported in pixi:
|filter|not supported fields|
|-|-|
|glow filter|BlueY|
|drop shadow Filter|BlurY, Inner shadow, knockout|
|Bevel Filter|BlurX&Y(fixed 0), Type(fixed inner), knockout,Strength(fixed 100%)|
|Adjust color filter|Hue,Brightness (please use 'brightness' in 'color effect' instead)|
|Gradient Bevel Filter|not supported|
|Gradient glow filter|not supported|

Example:
https://piximc.s3.amazonaws.com/demo/demo_filter.html

### mask layer:

It works!

## using functions texture atlas not provided

Here are some functions you can't export from Adobe Animate, but I have some replacement methods to impemtment them:
- add timeline script
- play sound on designated frame
- change scene
- blendmode


### Remark object:
I made a "demo/remark.fla" containing some "remark object" in "_remark/" folder (don't change the folder name!), just put them in the timeline and you can get the result.
- You can set the arguments in instance name.
- The remark object will hide automatically in the runtime. (just like guide layer's object in Adobe Animate)
- Most of remark objects will only be active in their first key frame.
- If you place any object in layer's name started with "remark_", the timeline will be hidden too(just like Guide layer), but the remark object function still active. I suggest you to place all the remark objects on the layers named 'remark_script','remark_sound' etc.

Arguments:
|remark|instance name|equal to|
|-|-|-|
|remark_gotoAndPlay|$123|gotoAndPlay(123)|
|remark_gotoAndStop|$label_init|gotoAndStop('label_init')|
|remark_blendMode|multiply|setting blend mode for the MC and all children in it (will auto cahnge to uppercase in runtime, see pixi's blendmode.).  Don't care which frame you place them , active in full timeline|
|remark_sound|se$047|play sound "047.mp3" in the exported MC folder(auto replace to .mp3 to .wav if mp3 file is missing)|
|remark_sound|bgm$boss1|play sound "boss1.mp3" with looping, auto stop if start play another "bgm"|
|remark_stopAllSound||don't have arguments |
|remark_play||don't have arguments |
|remark_stop||don't have arguments |
|remark_stopAtEnd||Don't have arguments.  auto stop the parent MovieClip at the end of timeline.  don't care which frame you place them , active in full timeline|




### Timeline script:  
There are three ways to add script on timeline.

	myMC.timeline.addSCript(7,(_mc)=>{...}) // call on frame 7
	myMC.timeline.addSCript('meet_first_boss',(_mc)=>{...}) // call on frame label
	myMC.timeline.addSCript('meet_final_boss',(_mc)=>{...}) // call on with the fist frame "remark_script" instance with instance name "meet_final_boss" appear

### Scene:  
if you export a MovieClip with:
- just one frame
- all children instance names are in the formats: 'scene1$sceneName','scene2'

MCModel will detect it as "MCScene" instead of "MC" Object. All children will become a scene and is sorted by the number in the instance name, and auto play starting from scene1  
(all scene objects positions will be moved to x:0,y:0)    
You can use 'nextScene','gotoSceneAndStop' to change scene  
MCScene doesn’t have timeline, but you can use 'MCScene.sceneTimeline' to access the current scene MC's timeline

### Soild color box:  
If a mc's symbol name is named "solidcolorbox_{hexColorCode}", eg "solidcolorbox_99191A",  
The texture in them will convert to a 1x1 pixel texture with that color.

## functions (may be) coming soon

Layer effect  
Changing skin  
Separate timeline in multi "actions" with remark object, and a "action player"

## API docs?

This is my first typescript, pixijs, git (and markdown) project,  
I may write a better doc with all api later...

## License

MIT License.