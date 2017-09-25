import {Option as OptionInterface} from './Option';

abstract class File {

	id: number;
	name: string;
	parent: File;
	icon?: string;
    options: Array<OptionInterface>;
    field: number = -1;
    renaming: boolean = false;
    dir: boolean = false;

    constructor(id?: number, name?: string, parent?: File, icon?: string, options?: Array<OptionInterface>, dir?: boolean) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.icon = icon;
        this.options = options;
        this.dir = dir;
    }
}
export default File;
export {File};