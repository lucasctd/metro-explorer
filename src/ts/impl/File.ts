import FileInterface from '../interfaces/File';
import {Option as OptionInterface} from '../interfaces/Option';

export default class File extends FileInterface {

    public id: number;
	public name: string;
	public parent: File;
	public icon: string;
    options: Array<OptionInterface>;

	public getExtension() : string {
        const str = this.name.split(".");
        return str[str.length - 1];
	}
}