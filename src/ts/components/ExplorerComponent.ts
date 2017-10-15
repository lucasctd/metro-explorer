import Vue from 'vue';
import File from '../interfaces/File';
import FileImpl from '../impl/File';
import FileComponent from '../components/FileComponent';
import ContextMenuComponent from '../components/ContextMenuComponent';
import DialogComponent from '../components/DialogComponent';
import {Component, Prop, Watch} from 'vue-property-decorator';
import store from '../state/AppState';
import Option from '../impl/Option';

@Component({
    template: `<div id="explorer-component" class="explorer-component" :style="{width: width + 'px', height: height + 'px'}" @contextmenu.prevent.stop="contextMenu" @click="click">
                   	<ex-file :id="'ex_' + file.id" :rootId="rootId" v-for="file in files" :key="file.id" :file="file" :left="getLeftPos(file, explorerWidth)" :top="getTopPos(file, explorerWidth)" 
                   	:dragLimitSelector="dragLimitSelector" @select="selectFile" @deselect="deselectFile"></ex-file>
				   	<ex-context-menu :show.sync="showContextMenu" :top="cmTop" :left="cmLeft" :options="options"></ex-context-menu>
				   	<ex-dialog id="explorer-dialog" :show="showMoveDialog" :width="moveDialogWidthPx" @syncShow="updateShowMoveDialog">
				   		<ex-file :id="'dir_' + folder.id" v-for="(folder, index) in folders" :selected="selectedFolder.id === folder.id" @select="selectFolder" @deselect="deselectFolder" :key="folder.id" :rootId="rootId" :file="folder" 
							:left="getLeftPos(folder, moveDialogWidth, index)" :top="getTopPos(folder, moveDialogWidth, index)" dragLimitSelector="#explorer-dialog"></ex-file>
						<button @click="move" slot="footer" :disabled="numSelectedFolders === 0" class="explorer-move-button" :class="{disabled: numSelectedFolders === 0, enabled: numSelectedFolders > 0}">Move</button>
					</ex-dialog>
               </div>`,
    components: {
        "ex-file" : FileComponent,
		"ex-context-menu" : ContextMenuComponent,
        "ex-dialog" : DialogComponent
    },
	store
})
export default class ExplorerComponent extends Vue {

	@Prop({"default": 800})
	width: number;
	@Prop({"default": 600})
	height: number;

	cmTop: number = 0;//contextMenu
    cmLeft: number = 0;//contextMenu
    showContextMenu: boolean = false;
	dragLimitSelector: string = null;
	options: Array<Option> = [];
	selectedFolder: File = new FileImpl();
	numSelectedFolders: number = 0;
    selectedFiles: Array<File> = [];
	rootId: string;
	moveDialogWidthPx: number = 600;

    private FILE_WIDTH: number = 110;
    private FILE_HEIGHT: number = 140;

	constructor() {
		super();
		this.dragLimitSelector = "#explorer-component";
		this.rootId = this.$parent.$el.id;
	}
	
	mounted() {
		this.updateFilesField();
		store.dispatch('setWidth', {id: this.rootId, explorerWidth: this.explorerWidth});
		this.loadContextMenu();
		
		document.addEventListener("movingToChild", (e) => {
            console.log(e);
		});
	}
	
	@Watch('currentDir')
    onCurrentDirChange() {
		this.updateFilesField();
	}	
	
	selectFolder(folder) {
		this.selectedFolder = folder;
		this.numSelectedFolders++;
	}
	
	deselectFolder(folder) {
		this.numSelectedFolders--;
	}

    selectFile(file: File) {
        this.selectedFiles.push(file);
    }

    deselectFile(file: File) {
        this.selectedFiles = this.selectedFiles.filter(f => f.id !== file.id);
    }
	
	loadContextMenu() {
		this.options.push(new Option('New Folder', () => {
			this.$parent.$options.methods['newFolder'].call(null);
			this.updateFilesField();			
		}));
	}

	updateFilesField() {
		let usedFields: Array<number> = [];
		this.files.forEach(f => {
			if(f.field !== -1){
				usedFields.push(f.field);
			}		
		});
		let counter = 0;
		this.files.forEach(f => {
			if(f.field === -1){
				while(usedFields.includes(counter)){
					counter++;
				}
				usedFields.push(counter);
				f.field = counter;
			}		
		});
	}

    click() {
        document.querySelector("#" + this.rootId).dispatchEvent(new Event('deselectAll'));
	}
	
	contextMenu(e) {
		document.dispatchEvent(new Event('closeAllContextMenu'));
		this.click();
        this.cmTop = e.clientY;
        this.cmLeft = e.clientX;
        setTimeout(() => this.showContextMenu = true, 30);
    }
	
	add(file: File): void {
	}

	move() {
		let file: FileImpl = null;
		let movingToChild: boolean = false;
		const explorerElement = document.getElementById(this.rootId);
	    this.selectedFiles.forEach(f => {
            file = f as FileImpl;
			if(f.dir === true){
				movingToChild = this.checkIfMovingToChild(f);
				if(movingToChild === true){
					explorerElement.dispatchEvent(new CustomEvent("movingToChild", {'detail': {file: f}));
					return; //continue
				}
			}
			file.visible = false;
			file.field = -1;
            setTimeout(() => {//wait for the fade out effect gets done.
                file.parent = new FileImpl(this.unfoldFolderId(this.selectedFolder.id), this.selectedFolder.name, this.selectedFolder.parent, 
					this.selectedFolder.icon, this.selectedFolder.options, this.selectedFolder.dir);
                store.dispatch('updateFile', {id: this.rootId, file: file});
            }, 450);
        });
        this.$parent.$data['showMoveDialog'] = false;
        this.$parent.$options.methods['move'].call(null, this.selectedFiles);		
    }
	
	private checkIfMovingToChild(folder: File): boolean {
		let children: Array<File> = this.findFolderChildren(folder.id);
		return children.length > 0;
	}
	
	private findFolderChildren(parentId: number): Array<File> {
		let children: Array<File> = [];
		this.files.forEach(f => {
			if(f.parent.id === parentId && f.dir === true) {
				children.push(f);
				children = children.concat(this.findFolderChildren(f.id));
			}
		});
		return children;
	}
	
	getLeftPos(file: File, numGridX: number, fileField?: number): number {
		let field = null;
		fileField = fileField !== undefined ? fileField : file.field;
		if(fileField < numGridX){
			field = fileField;
		}else{
			field = (fileField / numGridX) - Math.trunc(fileField / numGridX);
			field*=numGridX;
		}
		return (field * 5) + (field * this.FILE_WIDTH);
	}

	getTopPos(file: File, numGridX: number, fileField?: number): number {
		let top = Math.trunc((fileField ? fileField : file.field) / numGridX);
		return (5 * top) + (top * this.FILE_HEIGHT);
	}

    registerListeners() {
        document.addEventListener("click", (e) => {
            this.selectedFolder = null;
        });
    }
	
	createBackButton(): File {
		const backButton = new FileImpl(-1,'Back', undefined, 'arrow-left', 
			[
				new Option('Back', () => {
					this.$parent.$data['currentDir'] = this.currentDir.parent;
				}, true)
			]
		);
		backButton.field = 0;
		return backButton;
	}
	
	checkFilesThatShouldBeVisible(files: Array<File>): Array<File> {
		return files.filter(f => {
			const validFile: boolean = f.parent.id === this.currentDir.id;
			let file = f as FileImpl;
			file.visible = validFile;
            return validFile;
        });
	}
	
	obfuscateFolderId(id: number): number {
		return id * 10;
	}
	
	unfoldFolderId(id: number): number {
		return id / 10;
	}
	
	updateShowMoveDialog(val: boolean) {
		this.$parent.$data['showMoveDialog'] = val;
	}

	/** Computed **/
	get files(): Array<File> {
		let files: Array<File> = store.getters.getFiles(this.rootId);
		files = this.checkFilesThatShouldBeVisible(files);
		if(this.currentDir.id !== 0){//if it's not the root folder
		    files.push(this.createBackButton());
        }
		return files;
	}

	get folders(): Array<File> {
		let folders: Array<File> = store.getters.getFiles(this.rootId).filter(f => {
			return f.dir === true && this.currentDir.id !== f.id;
		}).map(f => {
			return new FileImpl(this.obfuscateFolderId(f.id), f.name, f.parent, f.icon, f.options, f.dir);//make a deep copy of the directory (not only the "pointer") not only its reference.
		});
		return folders;
	}
	
	get explorerWidth(): number {
		return Math.trunc(this.width / this.FILE_WIDTH) - 1;
	}
	
	get moveDialogWidth(): number {
		return Math.trunc(this.moveDialogWidthPx / this.FILE_WIDTH) - 1;
	}

	get showMoveDialog(): boolean {
	    return this.$parent.$data['showMoveDialog'];
    }

    get currentDir(): File {
	   return this.$parent.$data['currentDir'];
    }
}