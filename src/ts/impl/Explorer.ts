
import ExplorerComponent from '../components/ExplorerComponent';
import DialogComponent from '../components/DialogComponent';
import File from '../interfaces/File';
import {File as FileImpl} from './File';
import Vue from '../Vue';
import store from '../state/AppState';
import StateData from '../state/StateData';
import Option from './Option';

class Explorer extends Vue{

	private vue: Vue;
	private data: StateData;

	constructor(id: string, files?: Array<File>) {
		super();
		this.data = new StateData(id, files);
		store.dispatch('addExplorerData', this.data);
	}
	
	run(): void {
		this.vue = new Vue({
			el: this.data.id,
			store,
			components: {
				"ex-plorer": ExplorerComponent,
                "ex-dialog": DialogComponent
			}
		});
	}
	
	public setFiles(files: Array<File>): void {
		this.data.files.forEach(f => {
			if(!f.options && f.dir !== true){
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
		this.data.files = files;
        store.dispatch('setFiles', {id: this.data.id, file: this.data.files});
    }
	
	protected deleteFile(e, file: FileImpl): void {
		file.visible = false;
		setTimeout(() => store.dispatch('deleteFile', {id: this.data.id, file: file}), 750);
	}

    protected renameFile(e, file: File): void {
        file.renaming = true;
		store.dispatch('updateFile', {id: this.data.id, file: file});
	}

    protected moveFile(e, file: File): void {
		console.log('moveFile');
	}
	
}

export {Explorer, store, DialogComponent};
export default Explorer;