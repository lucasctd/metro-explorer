import File from "../interfaces/File";

class StateData {

	id: string;
	files: Array<File>;
    width: number = 5; //in blocks
	//selectedFiles: Array<File> = [];
	
	constructor(id: string,	files?: Array<File>){
		this.id = id;
		this.files = files;
	}    
}

export default StateData;
export {StateData};