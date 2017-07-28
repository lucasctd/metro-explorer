import {Option as OptionInterface, OptionCallbackType} from '../interfaces/Option';
import File from '../interfaces/File';

class Option implements OptionInterface {

    name: string;
    callback: OptionCallbackType;
    disabled: boolean = false;
	visible: boolean = true;

    constructor(name: string, callback: OptionCallbackType) {
        this.name = name;
        this.callback = callback;
    }

    callbackFunc(e, file: File) {
        this.callback(e, file);
    }
}
export default Option;
export {Option, OptionCallbackType};