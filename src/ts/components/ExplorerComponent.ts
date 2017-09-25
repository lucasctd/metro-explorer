import Vue from 'vue';
import File from '../interfaces/File';
import FileImpl from '../impl/File';
import FileComponent from '../components/FileComponent';
import ContextMenuComponent from '../components/ContextMenuComponent';
import DialogComponent from '../components/DialogComponent';
import {Component, Prop} from 'vue-property-decorator';
import store from '../state/AppState';
import Option from '../impl/Option';

@Component({
    template: `<div id="explorer-component" class="explorer-component" :style="{width: width + 'px', height: height + 'px'}" @contextmenu.prevent.stop="contextMenu">
                   	<ex-file :rootId="rootId" v-for="file in files" :key="file.id" :file="file" :left="getLeft(file, numGridX)" :top="getTop(file, numGridX)" :dragLimitSelector="dragLimitSelector"></ex-file>
				   	<ex-context-menu :show.sync="showContextMenu" :top="cmTop" :left="cmLeft" :options="options"></ex-context-menu>
				   	<ex-dialog id="explorer-dialog" :show="true" :width="moveDialogWidth">
				   		<ex-file v-for="(folder, index) in folders" :selected="selectedFolder.id === folder.id" @select="selectFolder" :key="folder.id" :rootId="rootId" :file="folder" 
							:left="getLeft(folder, moveDialogNumGridX, index)" :top="getTop(folder, moveDialogNumGridX, index)" dragLimitSelector="explorer-dialog"></ex-file>
						<button @click="" slot="footer" :disabled="selectedFolder == null" class="explorer-move-button" :class="{disabled: selectedFolder == null, enabled: selectedFolder != null}">Move</button>
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

	cmTop: number = 0;
    cmLeft: number = 0;
    showContextMenu: boolean = false;
	dragLimitSelector: string = null;
	options: Array<Option> = [];
	selectedFolder: File = new FileImpl();
	rootId: string;
	moveDialogWidth: number = 500;
	
	private FILE_WIDTH: number = 110;
	private FILE_HEIGHT: number = 140;
	private currentDir: File = new FileImpl(0, "Root", null, "folder-o");
	private numGridX: number = null;
	private moveDialogNumGridX: number = 3;
		
	constructor() {
		super();
		this.dragLimitSelector = "#explorer-component";
		this.rootId = this.$parent.$el.id;
	}
	
	mounted() {
		this.updateFilesField();
		this.setGridSize();
		this.setMoveDialogGridSize();
		this.loadContextMenu();
	}
	
	selectFolder(folder) {
		console.log(folder);
		this.selectedFolder = folder;
	}
	
	loadContextMenu() {
		this.options.push(new Option('New Folder', () => console.log('New Folder')));
	}

	updateFilesField() {
		let usedFields: Array<number> = [];
		this.files.forEach(f => {
			if(f.field !== -1){
				usedFields.push(f.field);
			}		
		});
		let counter = -1;
		this.files.forEach(f => {
			if(f.field === -1){
				while(usedFields.includes(counter++));
				f.field = counter;
			}		
		});
	}
	
	contextMenu(e) {
		document.dispatchEvent(new Event('closeAllContextMenu'));
        this.cmTop = e.clientY;
        this.cmLeft = e.clientX;
        setTimeout(() => this.showContextMenu = true, 30);
    }
	
	setMoveDialogGridSize() {
		this.moveDialogNumGridX = Math.trunc(this.moveDialogWidth / this.FILE_WIDTH) - 1;
	}

	setGridSize(): void {
		const gridX: number = Math.trunc(this.width / this.FILE_WIDTH);
		//const y: number = Math.trunc(this.height / this.FILE_HEIGHT);
		store.dispatch('setNumGridX', {id: this.rootId, numGridX: gridX - 1});
		this.numGridX = gridX - 1;
	}
	
	add(file: File): void {
		
	}
	
	getLeft(file: File, numGridX: number, fileField?: number): number {
		
		let field = null;
		fileField = fileField ? fileField : file.field;
		if(fileField < numGridX){
			field = fileField;
		}else{
			field = (fileField / numGridX) - Math.trunc(fileField / numGridX);
			field*=numGridX;
		}
		if(file.dir === true){
			console.log(file.dir);
			console.log('numGridX');
			console.log(numGridX);
		}
		return (field * 5) + (field * this.FILE_WIDTH);
	}

	getTop(file: File, numGridX: number, fileField?: number): number {
		let top = Math.trunc((fileField ? fileField : file.field) / numGridX);
		return (5 * top) + (top * this.FILE_HEIGHT);
	}

	/** Computed **/
	get files(): Array<File> {
		return store.getters.getFiles(this.rootId);
	}

	get folders(): Array<File> {
		return store.getters.getFiles(this.rootId).filter(f => {
			return f.dir === true && this.currentDir.id !== f.id;
		});
	}
}