import File as FileInterface from '../interfaces/File';

class File implements FileInterface{
	
	public id: number;
	public name: string;
	public parent: File;
	public icon: string;
	
    constructor(id: number, name: string, parent: File, icon: string) {
		this.id = id;
		this.name = name;
		this.parent = parent;
		this.icon = icon;
    }
	
	public getExtension() : string{
        const str = this.name.split(".");
        return str[str.length - 1];
	}
}