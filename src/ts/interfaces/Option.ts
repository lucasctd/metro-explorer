import File from './File';

type OptionCallbackType = (e, File) => any;

abstract class Option {
	name: string;
    callback: OptionCallbackType;
	disabled: boolean;
	visible: boolean;
}
export {Option, OptionCallbackType};