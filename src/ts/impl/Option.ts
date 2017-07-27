import {Option as OptionInterface, OptionCallbackType} from '../interfaces/Option';
import File from '../interfaces/File';

class Option implements OptionInterface {

    name: string;
    callback: OptionCallbackType;

    constructor(name: string, callback: OptionCallbackType) {
        this.name = name;
        this.callback = callback;
    }

    callbackFunc(e, file: File) {
        this.callback(e, file);
    }
}

export {Option, OptionCallbackType};