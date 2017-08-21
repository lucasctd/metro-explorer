import Vue from 'vue';
import File from '../interfaces/File';
import FileComponent from '../components/FileComponent';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';

@Component({
    template: `<div id="explorer_component" style="border: 2px dashed gray" :style="{width: width + 'px', height: height + 'px'}">
                   <ex-file v-for="file in files" :key="file.id" :file="file" :left="getLeft(file)" :top="getTop(file)" :dragLimitSelector="dragLimitSelector"></ex-file>
               </div>`,
    components: {
        "ex-file" : FileComponent
    }
})
export default class ExplorerComponent extends Vue {

    @Prop()
    files: Array<File>;
	@Prop()
	width: number;
	@Prop()
	height: number;
	
	dragLimitSelector: string = null;
	maxSizeX: number = 5;
	maxSizeY: number = 5;
	private FILE_WIDTH: number = 110;
	private FILE_HEIGHT: number = 140;
	
	constructor() {
		super();
		this.dragLimitSelector = "#explorer_component";
	}
	
	mounted(){
		this.setFields();
	}
	
	setFields() {
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
	
	addFile (file: File): void {
		
	}
	
	move (file: File): void	{
		
	}
	
	rename (file: File): void {
		
	}
	
	show (file: File): void {
		
	}
	
	getLeft(file: File) : number {
		let top = Math.trunc(file.field / this.maxSizeX);
		return (top * this.FILE_WIDTH) + 5;
	}
	
	getTop(file: File) : number {
		let top = Math.trunc(file.field / this.maxSizeX);
		return (top * this.FILE_HEIGHT) + 5;
	}
}