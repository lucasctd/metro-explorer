
import ExplorerComponent from '../components/ExplorerComponent';
import File from '../interfaces/File';
import {File as FileImpl} from './File';
import Vue from '../Vue';
import store from '../state/AppState';
import Option from './Option';

class Explorer extends Vue{

	private id: string;
	private vue: Vue;
    private files: Array<File>;

	constructor(id: string) {
		super();
		this.id = id;		
	}
	
	run(): void {
		store.dispatch('setFiles', this.files);
		this.vue = new Vue({
			el: this.id,
			store,
			components: {
				"ex-plorer": ExplorerComponent
			}
		});
	}
	
	public setFiles(files: Array<File>): void {
		files.forEach(f => {
			if(!f.options){
				f.options = [
						new Option("Move", (e, file) => {
							this.moveFile(e, file);
						}),
						new Option("Rename", (e, file) => {
							this.renameFile(e, file);
						}),
						new Option("Delete", (e, file) => {
							this.deleteFile(e, file);
						})						
					];
			}
		});
		this.files = files;
	}
	
	private deleteFile(e, file: FileImpl): void {
		file.visible = false;
		setTimeout(() => store.dispatch('deleteFile', file), 750);
	}

	private renameFile(e, file: File): void {
        file.renaming = true;
		store.dispatch('updateFile', file);
	}

	private moveFile(e, file: File): void {
		console.log('moveFile');
	}
	
}

export {Explorer};
export default Explorer;