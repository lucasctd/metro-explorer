abstract class File {

	id: number;
	name: string;
	parent: File;
	icon?: string;

    constructor(id: number, name: string, parent: File, icon: string) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.icon = icon;
    }
}
export default File;