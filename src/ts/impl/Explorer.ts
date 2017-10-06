
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
	private currentDir: File = new FileImpl(0, "Root", undefined, "folder-o");
	private folderOptions: Array<Option> = null;

	constructor(id: string, files?: Array<File>) {
		super();
		this.data = new StateData(id, files);
		store.dispatch('addExplorerData', this.data);
		this.folderOptions = [
			new Option('Open', (e, folder: File) => {
				this.openFolder(e, folder);
			}),
			new Option('Rename', (e, folder: File) => {
				this.renameFile(e, folder);
			}),
			new Option('Delete', (e, folder: File) => {
				this.deleteFolder(e, folder);
			})
		];
	}
	
	run(): void {
		const that = this;
		this.vue = new Vue({
			el: "#"+this.data.id,
			data: {
				showMoveDialog: false,
                currentDir: that.currentDir
			},
			store,
			components: {
				"ex-plorer": ExplorerComponent,
                "ex-dialog": DialogComponent
			},
			methods: {
				moveFile(files: Array<File>){
                    that.moveFile(files);
				},
				newFolder(){
                    that.newFolder();
				}
			}
		});
	}
	
	public setFiles(files: Array<File>): void {
		files.forEach(f => {
			if(!f.options){
				if(f.dir !== true){
                    f.options = [
                        new Option("Move", (e, file: File) => {
                            this.showMoveDialog();
                        }),
                        new Option("Rename", (e, file: File) => {
                            this.renameFile(e, file);
                        }),
                        new Option("Delete", (e, file: File) => {
                            this.deleteFile(e, file);
                        })
                    ];
				}else{
                    f.options = this.folderOptions;
				}
			}
			if(!f.parent){
                f.parent = this.currentDir;
			}
		});
		this.data.files = files;
        store.dispatch('setFiles', this.data);
    }
	
	protected deleteFile(e, file: File): void {
		const f = file as FileImpl;
		f.visible = false;
		setTimeout(() => store.dispatch('deleteFile', {id: this.data.id, file: f}), 450);
	}

    protected renameFile(e, file: File): void {
        file.renaming = true;
		store.dispatch('updateFile', {id: this.data.id, file: file});
	}

	protected showMoveDialog(): void{
        this.vue.$data['showMoveDialog'] = true;
	}

    protected moveFile(files: Array<File>): void {
        console.log("moveFile func has been called");
	}

    protected openFolder(e, folder: File): void {
		this.vue.$data['currentDir'] = folder;
    }

    protected deleteFolder(e, folder: File): void {
	}
	
	protected newFolder(): void {
		const file = new FileImpl(this.generateId(), 'New Folder', this.currentDir, 'folder-o', this.folderOptions, true);
		file.renaming = true;
		store.dispatch('addFile', {id: this.data.id, file});
		setTimeout(() => {
			const input = <HTMLElement> document.querySelector("#ex_" + file.id + " > .icon-area > .rename-input"); // cast, it could also be done like this document.querySelector("#ex_" + file.id + " > .icon-area > .rename-input") as HTMLElement
			input.focus();	
		}, 500);
	}

	private generateId(): number {
		let id = Math.floor((Math.random() * 1000) + 1);
		let usedIds: Array<number> = [];
		usedIds = store.getters.getFiles(this.data.id).map(f => f.id);
		while(usedIds.includes(id)){
			id = Math.floor((Math.random() * 1000) + 1);
		}
		return id;
	}
	
}

export {Explorer, store, DialogComponent};
export default Explorer;