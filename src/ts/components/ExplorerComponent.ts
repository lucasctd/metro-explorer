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
                   	<ex-file :rootId="rootId" v-for="file in files" :key="file.id" :file="file" :left="getLeftPos(file, explorerWidth)" :top="getTopPos(file, explorerWidth)" :dragLimitSelector="dragLimitSelector"></ex-file>
				   	<ex-context-menu :show.sync="showContextMenu" :top="cmTop" :left="cmLeft" :options="options"></ex-context-menu>
				   	<ex-dialog id="explorer-dialog" :show="true" :width="moveDialogWidthPx">
				   		<ex-file v-for="(folder, index) in folders" :selected="selectedFolder.id === folder.id" @select="selectFolder" :key="folder.id" :rootId="rootId" :file="folder" 
							:left="getLeftPos(folder, moveDialogWidth, index)" :top="getTopPos(folder, moveDialogWidth, index)" dragLimitSelector="explorer-dialog"></ex-file>
						<button @click="" slot="footer" :disabled="!selectedFolder.id" class="explorer-move-button" :class="{disabled: selectedFolder === null, enabled: selectedFolder !== null}">Move</button>
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
	rootId: string;
	moveDialogWidthPx: number = 600;
	
	private FILE_WIDTH: number = 110;
	private FILE_HEIGHT: number = 140;
	private currentDir: File = new FileImpl(0, "Root", null, "folder-o");
		
	constructor() {
		super();
		this.dragLimitSelector = "#explorer-component";
		this.rootId = this.$parent.$el.id;
	}
	
	mounted() {
		this.updateFilesField();
		store.dispatch('setWidth', {id: this.rootId, explorerWidth: this.explorerWidth});
		this.loadContextMenu();
	}
	
	selectFolder(folder) {
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
	
	add(file: File): void {
		
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

	/** Computed **/
	get files(): Array<File> {
		return store.getters.getFiles(this.rootId);
	}

	get folders(): Array<File> {
		return store.getters.getFiles(this.rootId).filter(f => {
			return f.dir === true && this.currentDir.id !== f.id;
		});
	}
	
	get explorerWidth(): number {
		return Math.trunc(this.width / this.FILE_WIDTH) - 1;
	}
	
	get moveDialogWidth(): number {
		return Math.trunc(this.moveDialogWidthPx / this.FILE_WIDTH) - 1;
	}
}