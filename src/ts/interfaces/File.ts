import {Option as OptionInterface} from './Option';

abstract class File {

	id: number;
	name: string;
	parent: File;
	icon?: string;
	options: Array<OptionInterface>;

    constructor(id: number, name: string, parent: File, icon: string, options: Array<OptionInterface>) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.icon = icon;
        this.options = options;
    }

}
export default File;
export {File};