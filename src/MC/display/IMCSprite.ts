import MCDisplayObject from './MCDisplayObject';
import {MCType} from '../model/MCStructure';
import MCSymbolModel from '../model/MCSymbolModel';

export default interface IMCSprite extends MCDisplayObject{
    type:MCType,
    symbolModel:MCSymbolModel
}