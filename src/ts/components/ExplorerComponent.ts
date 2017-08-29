import Vue from 'vue';
import File from '../interfaces/File';
import FileComponent from '../components/FileComponent';
import ContextMenuComponent from '../components/ContextMenuComponent';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';
import store from '../state/AppState';

@Component({
    template: `<div id="explorer_component" class="explorer_component" :style="{width: width + 'px', height: height + 'px'}">
                   <ex-file v-for="file in files" :key="file.id" :file="file" :left="getLeft(file)" :top="getTop(file)" :dragLimitSelector="dragLimitSelector"></ex-file>
				   <ex-context-menu :show.sync="showContextMenu" :top="cmTop" :left="cmLeft" :options="file.options" :file="file"></ex-context-menu>
               </div>`,
    components: {
        "ex-file" : FileComponent,
		"ex-context-menu" : ContextMenuComponent
    },
	store
})
export default class ExplorerComponent extends Vue {

	@Prop({"default": 800})
	width: number;
	@Prop({"default": 600})
	height: number;
	
	dragLimitSelector: string = null;
	private FILE_WIDTH: number = 110;
	private FILE_HEIGHT: number = 140;
	
	constructor() {
		super();
		this.dragLimitSelector = "#explorer_component";
	}
	
	mounted(){
		this.updateFilesField();
		this.setGridSize();
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

	setGridSize(): void {
		const x: number = Math.trunc(this.width / this.FILE_WIDTH);
		const y: number = Math.trunc(this.height / this.FILE_HEIGHT)
		store.dispatch('setNumGridX', x - 1);
	}
	
	add (file: File): void {
		
	}
	
	getLeft(file: File) : number {
		let field = null;
		if(file.field < store.state.numGridX){
			field = file.field;
		}else{
			field = (file.field / store.state.numGridX) - Math.trunc(file.field / store.state.numGridX);
			field*=store.state.numGridX;
		}
		return (field * 5) + (field * this.FILE_WIDTH);
	}
	
	getTop(file: File) : number {
		let top = Math.trunc(file.field / store.state.numGridX);
		return (5 * top) + (top * this.FILE_HEIGHT);
	}
	
	/** Computed **/
	
	get files(): Array<File> {
		return store.state.files;
	}
}