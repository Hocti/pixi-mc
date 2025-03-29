

# pixi-mc (PixiJS MovieClip)

[![npm version](https://badge.fury.io/js/pixi-mc.svg)](https://www.npmjs.com/package/pixi-mc)


Play an Adobe Animate (Flash) MovieClip in [PixiJS ](https://github.com/pixijs/pixijs), using the "generate texture atlas" file format.

Here's the demo result, a conversion of my friend's Flash animation from 2002:
https://piximc.s3.amazonaws.com/demo/demo_scene.html  
(Note: Only scene 5 includes sounds and scripts.)

Below is the original Flash version (browser with Flash player required):
https://piximc.s3.amazonaws.com/demo/demo_swf.html  
p.s. This is a fan-made animation of the Hong Kong indie game "Little Fighter 2" (https://lf2.net).

Using PixiJS 's Sprite and Container implementation, you gain the ability to manipulate each child within the MovieClip as if it were a standard DisplayObject. Moreover, it's feasible to add scripts and sound to specific frames, switch scenes,  and set properties like alpha, tint, brightness, and filters in Adobe Animate before exporting to PixiJS . Alternatively, you can use the original export file as a library, attaching the MovieClip's children to the stage manually.

Adobe Animate allows for the creation of graphics and animations which can then be exported, with the addition of scripting in JavaScript.
(Why not use Spine, you might ask? Spine lacks pencil and brush tools. I prefer to draw and animate in one integrated environment.)

## Setup


load [PixiJS](https://github.com/pixijs/pixijs), [PixiJS Filters](https://github.com/pixijs/filters), [PixiJS Sound](https://github.com/pixijs/sound) before using pixi-mc

#### NPM Install
```sh
	npm install pixi-mc
```

#### CDN Install

Via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/pixi-mc/dist/pixi-mc.min.js"></script>
```


#### download a prebuilt build:
[release](https://github.com/Hocti/pixi-mc/releases/)


## v2.1.1

Moves to PixiJS  v7.2+
using '@pixi/assets' replace the '@pixi/loaders'
updated some filters to PixiJS  v7.2+ standard

removed "FileList"

## v3.0.0

Moves to PixiJS  v8

### Versions Compatibility

| PixiJS | pixi-mc |
|---|---|
| v5.x - v6.x | v1.0 |
| v7.x | v2.1 |
| v8.x | v3.0 |

## Code example

To load texture atlas files and create a MovieClip (MC) instance in PixiJS , follow these steps:

1. **Use 'MCLoader':** This is analogous to the Loader in ActionScript 3 (AS3). Utilize 'MCLoader' to load all the texture atlas files. This process is similar to how you would load external resources in Flash.

2. **Return a 'MCModel':** The 'MCModel' can be thought of as the equivalent of a SWF file in Flash. This model will contain multiple 'MCSymbolModel' instances, which are akin to the Linkage MovieClip Classes in AS3. 
Among these, one will be designated as the main Symbol, which is the MovieClip that you have exported.

3. **Create an 'MC' Instance from the 'mainSymbolModel' in 'MCModel':** Once you have the MCModel, you can instantiate your 'MC' (MovieClip) from it.


### Load the files and add to stage:

```js
piximc.MCLoader.autoLoadModel('/media/cat/',['meow.mp3']).then( function (model) {

	//make instance
	var catMC = new piximc.MC(model.mainSymbolModel);
	var catMC2 = model.makeInstance();//shortcut

	app.stage.addChild(catMC);
	//after added to stage, MC would auto showing frame1, and add Children at frame 1

	catMC.timeline.gotoAndStop(5);
	//auto add/remnove children in/not at that frame

	//make instance from MC's child
	var catHeadMC = new piximc.MC(model.symbolList['cat_head']);
	catHeadMC.x=100;
	catMC.addChild(catHeadMC);//two head cat...

	var catHeadMC2= model.makeInstance('cat_head')
	catHeadMC2.x=-100;
	catMC.addChild(catHeadMC2);//three head cat...

	//clone MC
	var catHeadMC3= new piximc.MC(catHeadMC.MCSymbolModel);
	catHeadMC.addChild(catHeadMC3);//you can add a child inside same type of MC Model

	//after you loaded a MC, you can find the model by it's folder path :
	var catModel=MCLibrary.getInstance().get('/media/cat/');
	var catMC3 = new piximc.MC(catModel);
})
```

Add to Stage before load done:

```js
var myMcLoaderContainer = piximc.MCLoader.createLoaderContainer('media/FilterDemo/', function (loader,content) {
	//created a PIXI.Container, would addChild to the Container automaticlly after the MC loaded
});
myMcLoaderContainer.x=400;
app.stage.addChild(myMcLoaderContainer);
```

## Timeline

Each MC possesses a timeline, similar to ActionScript 3 (AS3). You can control the timeline with commands akin to AS3's functionality. For instance:

- To stop the timeline, use `myMC.timeline.stop()`.
- To play the timeline from a specific frame, use `myMC.timeline.gotoAndPlay(7)`.


Before utilizing these timeline controls, it's crucial to initialize 'MCPlayer':

```js
//app is PIXI.Application
piximc.MCPlayer.initTicker(app.ticker);		//inital MCPlayer
piximc.MCPlayer.getInstance().fps = 24;		//set to ftp to 12,default is 60

//optional if you need playing sound in piximc
piximc.TSound.initTicker(app.ticker);
```

- Every MC employs `piximc.MCPlayer.getInstance()` as its default player. However, this can be manually altered if needed.

Regarding frame changes and child elements:

- Changing the frame will remove any children that are not present in the new frame. 
- This does not affect children added manually to the MC; these manually added children will always remain on top.

- While it's possible to alter the playing speed of each timeline, be aware that this may impact the triggering of frame-specific sounds and scripts. Adjusting the speed could lead to these elements not being activated as expected.

	mc.timeline.speed=1.75


## fla example and setting

How to export texture:
In Adobe Animate,open library, right click The MovieClipc you want to export , click 'Generate Texture Atlas...'

### Export setting:
- **must tick "Optimize Animation.json file"**
- **Resolution 1x only** - Due to an Adobe bug, all bitmap objects should be exported at a 1x resolution. Despite selecting higher resolutions, bitmaps are still exported at 1x, leading to quality inconsistencies.
- **Image Dimension Limitations**: Avoid using images larger than 2048 pixels in dimension.
- **1px Padding Recommended:** Including a 1px padding around your assets can prevent visual artifacts, such as bleeding or aliasing, when the images are rendered in PixiJS . This padding creates a buffer zone around each asset.
- **Single Bitmap Grouping in Multi-Object Frames**: When a single frame MovieClip contains multiple objects, they may be grouped into one bitmap. To prevent this and ensure individual export of each object, extend the timeline to two frames.

### Filter:
Some fields in Adobe Animate filter not supported in pixi:
|filter|not supported fields|
|-|-|
|glow filter|BlueY|
|drop shadow Filter|BlurY, Inner shadow, knockout|
|Bevel Filter|BlurX&Y(fixed 0), Type(fixed inner), knockout,Strength(fixed 100%)|
|Adjust color filter||
|Gradient Bevel Filter|not supported|
|Gradient glow filter|not supported|

Example:
https://piximc.s3.amazonaws.com/demo/demo_filter.html

### mask layer:

It works!

## using functions texture atlas not provided

pixi-mc implementing features in PixiJS  that are not directly exportable from Adobe Animate involves a creative use of replacement methods and custom scripting:

1. **Add Timeline Script:** You've developed a workaround for adding scripts to the timeline. This is crucial for interactivity and control over the animation sequence.

2. **Play Sound on Designated Frame:** You've created a method to trigger sound playback at specific frames in the animation, replicating the timeline sound feature in Flash.

3. **Change Scene:** You've implemented a technique for scene transitions, essential for animations with multiple scenes or stages.

4. **Blend Mode:** You've found a way to mimic the blend mode effects available in Adobe Animate, which is important for achieving various visual effects.

5. **Visible (Hide Object):** Your method allows for the toggling of visibility, similar to the "Hide Object" feature in Animate CC's Properties panel.


### Remark object:

I made a "tools/remark.fla" containing some "remark object" in "_remark/" folder (don't change the folder name!), just put them in the timeline and you can get the result.
- **Argument Setting in Instance Name:** You allow for the configuration of these objects through their instance names
- **Automatic Hiding in Runtime:** These objects are designed to be hidden during runtime, functioning like guide layer objects in Adobe Animate. 
- **Activation Mostly in First Keyframe:** The remark objects are primarily active in their first keyframe
- **Use of Special Layer Naming for Hiding:** Any object placed in a layer whose name starts with "remark_" will be hidden (like a Guide layer in Animate), but the remark object function remains active. This suggests organizing all remark objects in layers named 'remark_script', 'remark_sound', etc., for better organization and clarity.

Arguments:
|remark|instance name|equal to|
|-|-|-|
|remark_gotoAndPlay|$123|gotoAndPlay(123) <br /> It's not permissible to start an instance name with a number in this context. Therefore, the use of '$' as a prefix|
|remark_gotoAndStop|$label_init|gotoAndStop('label_init')|
|remark_blendMode|multiply|setting blend mode for the MC and all children in it (will auto change to uppercase in runtime, see pixi's blendmode.).  Don't care which frame you place them , active in full timeline|
|remark_sound|se$047|play sound "047.mp3" in the exported MC folder(auto replace to .mp3 to .wav if mp3 file is missing)|
|remark_sound|bgm$boss1|play sound "boss1.mp3" with looping, auto stop if start play another "bgm"|
|remark_stopAllSound||Don't have arguments |
|remark_play||Don't have arguments |
|remark_stop||Don't have arguments |
|remark_stopAtEnd||Don't have arguments.<br/>auto stop the parent MovieClip at the end of timeline.  don't care which frame you place them , active in full timeline|




### Timeline script:  
There are three ways to add script on timeline.

```js
myMC.timeline.addScript(7,(_mc)=>{...}) // call on frame 7
myMC.timeline.addScript('meet_first_boss',(_mc)=>{...}) // call on frame label
myMC.timeline.addScript('meet_second_boss',(_mc)=>{...}) // call on with the first frame "remark_script" instance with instance name "meet_second_boss" appear
```

### Scene Management:  
When exporting a MovieClip with the following characteristics:

- Contains only one frame.
- All child instances are named in formats like 'scene1$sceneName', 'scene2', etc.

The MCModel will recognize it as an "MCScene" object rather than a standard "MC" object. Each child instance becomes a scene, sorted numerically based on the number in its instance name. The MCScene will automatically start playing from 'scene1'.
- All scene object positions are reset to coordinates x:0, y:0.
- You can navigate between scenes using methods like 'nextScene' and 'gotoSceneAndStop'.
- Unlike regular MC objects, MCScene doesn't have its own timeline. However, you can access the current scene MC's timeline through 'MCScene.sceneTimeline'.

### Solid Color Box Implementation:
For creating a solid color box:
- Name the MC's symbol as "solidcolorbox_{hexColorCode}". For example, "solidcolorbox_99191A".
- The texture within these symbols will be converted to a 1x1 pixel texture, filled with the specified hex color code.
This feature is particularly useful for creating color-specific graphics or backgrounds efficiently without the need for larger image files.

# Extra functions ~~(may be) coming soon~~ I did it✌️

### EffectGroup
grouped: visible,alpha,blendMode,filters,colorMatrix in one object

### MCEX
extented for MC
**setLayerEffect** can set EffectGroup in specify layer

### MCReplacer:
You can set some rule for specify Symbol, and replace to another Symbol in MCEX (just like Spine's slot)
Also you can change the EffectGroup or special Symbol for specify **Layer**

### LabelMC:
extented for MCEX
With LabelTimeline, you to "playTo" a frame label/number (not jump to) from current frame, it would choose play obverse or reverse automatically

### MCActor, with remark [action,phase,geom]:
You can add multi **MCSymbolModel** (with adding **action/phase remark** in fla file) in a **MCActor**, then choose which action & phase to show by **showAction**, the MCActor would show the correct MCEX and frame

### MCActorplayer:
Play MCActor with List of Steps

### MCSheet
`MCSheet` is a wrapped `pixi.js` `AnimatedSprite`, used to load SpriteSheets generated from Adobe Animate, and added `timeline` function and `MCEffect` extended from `MC`. (MCSheet will sync playback timing with the global `MCPlayer`.)
piximc can load `Sparrow v2`'s XML or `JSON` formats. Using `Sparrow v2` can retain the `pivot` position; otherwise, when using the JSON format, you need to include an empty frame somewhere in the timeline to provide the `pivot`.  
1) Use `piximc.loadSpriteSheet({json or xml path})` to load and return a `pixi.js SpriteSheet` object.  
2) Use `new MCSheet({SpriteSheet Object})` to create a new `MCSheet`.  
3) you can using `piximc.getSheet({json}).sheet` tp get the SpriteSheet Object cache which loaded in step 1

# License

MIT License.