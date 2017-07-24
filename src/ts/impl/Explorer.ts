import Vue from 'vue';
import FileComponent from '../components/FileComponent';
import ContextMenuComponent from '../components/ContextMenuComponent';
import Upload from '../impl/Upload';
import UploadInterface from '../interfaces/Upload';
import File from '../interfaces/File';
import FileImpl from '../impl/File';
import {Container} from 'huject';

export class Explorer {

	private id: string;
	private vue: Vue;
    private container;
    public file: File;

	constructor(id: string) {
		this.id = id;
        this.file = new FileImpl(1, "Arquivo", undefined, "file-word-o");
		let data = {file: this.file};
        this.vue = new Vue({
			el: this.id,
            data: data,
            components: {
                "ex-context-menu" : ContextMenuComponent,
                "ex-file": FileComponent

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