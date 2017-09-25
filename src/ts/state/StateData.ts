import File from "../interfaces/File";

class StateData {

	id: string;
	files: Array<File>;
    numGridX: number = 5;
	//selectedFiles: Array<File> = [];
	
	constructor(id: string,	files?: Array<File>){
		this.id = id;
		this.files = files;
	}    
}

export default StateData;
export {StateData};