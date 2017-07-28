import Vue from 'vue';
import ExplorerComponent from '../components/ExplorerComponent';

import File from '../interfaces/File';
import {File as FileImpl} from './File';

import Option from './Option';

class Explorer {

	private id: string;
	private vue: Vue;
    public file: File;

	constructor(id: string) {
		this.id = id;
		let opt = new Option("Show", (e, file) => {
				console.log("Show");
				console.log(file);
			});
			opt.disabled = true;
		let options: Array<Option> = [
			opt,
			new Option("Edit", (e, file) => {
				console.log("Edit");
				console.log(file);
			}),
			new Option("Delete", (e, file) => {
				console.log("Delete");
				console.log(file);
			})
		];
		let data = {files: [new FileImpl(1, "Arquivo", undefined, "file-word-o", options)]};

        this.vue = new Vue({
			el: this.id,
            data: data,
            components: {
                "ex-plorer": ExplorerComponent
            }
		});
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

export {Explorer};
export default Explorer;