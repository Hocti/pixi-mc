import MCDisplayObject from './MCDisplayObject';
import Timeline from '../player/Timeline';
import MCPlayer from '../player/MCPlayer';

export default interface IMCwithTimeline extends MCDisplayObject{
    timeline:Timeline,
    player:MCPlayer,
    showFrame(frame:number):void,
}