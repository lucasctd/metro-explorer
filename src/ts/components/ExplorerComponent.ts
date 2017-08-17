import Vue from 'vue';
import File from '../interfaces/File';
import FileComponent from '../components/FileComponent';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';

@Component({
    template: `<div id="explorer_component" style="border: 2px dashed gray" :style="{width: width + 'px', height: height + 'px'}">
                   <ex-file v-for="file in files" :key="file.id" :file="file" :coll="getLeft(file)" :row="getTop(file)" :dragLimitSelector="dragLimitSelector"></ex-file>
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
	matriz: Array<Array<File>> = [[]];
	maxSizeX: number = 5;
	maxSizeY: number = 5;
	
	constructor() {
		super();
		this.dragLimitSelector = "#explorer_component";
	}
	
	mounted(){
		this.loadMatriz();
	}
	
	loadMatriz() {
		this.files.forEach(f => {
			if(f.field === -1){
				loop:
				for(let y = 0; y < this.maxSizeY; y++){
					for(let x = 0; x < this.maxSizeX; x++){
						if(this.matriz[y][x] === undefined){
							this.matriz[y][x] = f;
							break loop;
						}
					}
				}
			}else{
			
			}			
		});
	}
	
	getFirstFreeField() : number {
		return null;
	}
	
	addFile (file: File): void {
		
	}
	
	move (file: File): void	{
		
	}
	
	rename (file: File): void {
		
	}
	
	show (file: File): void {
		
	}
	
	getLeft(file: File) : number{
		return 0;
	}
	
	getTop(file: File) : number{
		return 0;
	}
}