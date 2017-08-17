import File from './File';

type OptionCallbackType = (e, File) => any;

abstract class Option {
	name: string;
    callback: OptionCallbackType;
	disabled: boolean = false;
	visible: boolean = true;
}
export default Option;
export {Option, OptionCallbackType};