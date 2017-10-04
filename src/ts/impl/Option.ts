import {Option as OptionInterface, OptionCallbackType} from '../interfaces/Option';
import File from '../interfaces/File';

class Option extends OptionInterface {

    constructor(name: string, callback: OptionCallbackType, _default?: boolean) {
        super();
        this.name = name;
        this.callback = callback;
		this._default = _default;
    }

    callbackFunc(e, file: File) {
        this.callback(e, file);
    }
}
export default Option;
export {Option, OptionCallbackType};