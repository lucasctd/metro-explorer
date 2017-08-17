import Vue from 'vue';
import ExplorerComponent from '../components/ExplorerComponent';

import File from '../interfaces/File';
import {File as FileImpl} from './File';

import Option from './Option';

class Explorer {

	private id: string;
	private vue: Vue;
    public files: Array<File>;

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
		let data = {files: [new FileImpl(1, "Arquivo", undefined, "file-word-o", options), new FileImpl(2, "Arquivo", undefined, "file-word-o", options)]};

        this.vue = new Vue({
			el: this.id,
            data: data,
            components: {
                "ex-plorer": ExplorerComponent
            }
		});
		const that = this;
		/*setTimeout(() => {
			console.log('change file name');
			//console.log(that.vue.files[0]);
            this.vue.files[0].name = "Fox";
        }, 5000);*/
	}	
}

export {Explorer};
export default Explorer;