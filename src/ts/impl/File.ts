import {File as FileInterface} from '../interfaces/File';
import {Option as OptionInterface} from '../interfaces/Option';

class File extends FileInterface {

    public id: number;
	public name: string;
	public parent: File;
	public icon: string;
    public options: Array<OptionInterface>;

	public getExtension() : string {
        const str = this.name.split(".");
        return str[str.length - 1];
	}
}

export default File;
export {File};