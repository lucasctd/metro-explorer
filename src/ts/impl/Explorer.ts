import Vue from 'vue';
import ExplorerComponent from '../components/ExplorerComponent';

import File from '../interfaces/File';
import {File as FileImpl} from './File';

import Option from './Option';

class Explorer extends Vue{

    el = "#explorer";
	private id: string;
	private vue: Vue;
    public files: Array<File>;

	constructor(id: string) {
		super();
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
		let data = {files: [new FileImpl(1, "Print", undefined, "file-word-o", options), new FileImpl(2, "Fox", undefined, "file-word-o", options)]};
		data.files[0].field = 10;
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