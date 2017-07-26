import File from './File';

type OptionCallbackType = (e, File) => any;

abstract class Option {
	name: string;
    callback: OptionCallbackType;
}
export {Option, OptionCallbackType};