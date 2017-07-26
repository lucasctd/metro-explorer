import Vue from 'vue';
import ExplorerComponent from '../components/ExplorerComponent';
import Upload from '../impl/Upload';
import UploadInterface from '../interfaces/Upload';
import File from '../interfaces/File';
import FileImpl from '../impl/File';
import {Option} from './Option';
import {Container} from 'huject';

export class Explorer {

	private id: string;
	private vue: Vue;
    private container;
    public file: File;

	constructor(id: string) {
		this.id = id;

		let data = {files: [new FileImpl(1, "Arquivo", undefined, "file-word-o", [new Option("New", (e, file) => {
		    console.log(e);
            console.log(file);
        })])]};

        this.vue = new Vue({
			el: this.id,
            data: data,
            components: {
                "ex-plorer": ExplorerComponent
            }
		});
        this.container = new Container();
		this.registerDI();
	}

	private registerDI(){
        this.container.register(UploadInterface, Upload);
    }

	build (): void {

	}
	
	addFile (file: File): void {
		
	}
	
	move (file: File): void	{
		
	}
	
	rename (file: File): void {
		
	}
	
	show (file: File): void {
		
	}
}