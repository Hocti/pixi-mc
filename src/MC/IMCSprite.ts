import MCDisplayObject from './MCDisplayObject';
import {MCType} from './MCStructure';
import MCSymbolModel from './MCSymbolModel';

export default interface IMCSprite extends MCDisplayObject{
    type:MCType,
    symbolModel:MCSymbolModel
}