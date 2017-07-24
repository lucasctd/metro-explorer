import FileInterface from '../interfaces/File';

export default class File extends FileInterface {
	
	public id: number;
	public name: string;
	public parent: File;
	public icon: string;

	public getExtension() : string {
        const str = this.name.split(".");
        return str[str.length - 1];
	}
}