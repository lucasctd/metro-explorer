import File from './File';

type OptionCallbackType = (e, File) => any;

abstract class Option {
	name: string;
    callback: OptionCallbackType;
	disabled: boolean = false;
	visible: boolean = true;
	_default: boolean = false;
}
export default Option;
export {Option, OptionCallbackType};