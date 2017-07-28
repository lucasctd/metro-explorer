import Vue from 'vue';
import File from '../interfaces/File';
import FileComponent from '../components/FileComponent';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';

@Component({
    template: `<div id="explorer_component" style="border: 2px dashed gray" :style="{width: width + 'px', height: height + 'px'}">
                   <ex-file v-for="file in files" :key="file.id" :file="file" :dragLimitSelector="dragLimitSelector"></ex-file>
               </div>`,
    components: {
        "ex-file" : FileComponent
    }
})
export default class ExplorerComponent extends Vue {

    @Prop()
    files: Array<File>;
	
	dragLimitSelector: string = null;
	width: number = 800;
	height: number = 600;
	
	constructor() {
		super();
		this.dragLimitSelector = "#explorer_component";
	}
}