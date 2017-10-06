import Vue from 'vue';
import File from '../interfaces/File';
import Draggable from '../interfaces/Draggable';
import ContextMenuComponent from '../components/ContextMenuComponent';
import {DependencyInjector} from '../huject.config';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../state/AppState';
import * as _ from "lodash";
import Option from '../interfaces/Option';

@Component({
    template: `<transition name="explorer-fade">
				<div :id="id" class="explorer-file" v-show="file.visible" @click.stop="fileSelected = !fileSelected" 
					@contextmenu.prevent.stop="contextMenu" :style="{top: top + 'px', left: left + 'px'}" @dblclick="dblclick">
                    <div v-show="fileSelected && file.renaming === false" class="file-selected"></div>
                    <div class="icon-area">
                        <i class="fa fa-4x icon" :class="icon"></i>
                        <p class="file-name" v-show='!file.renaming'>{{file.name}}</p>
                        <input :id="'rename_' + file.id" v-model='file.name' @blur="file.renaming = false" v-show="file.renaming" @keyup="updateFileName(file)" @click.stop="selected = false" class="rename-input" style="font-size: 12pt"/>
                    </div>
                    <ex-context-menu :show.sync="showContextMenu" :top="cmTop" :left="cmLeft" :options="file.options" :file="file"></ex-context-menu>
               </div>
			   </transition>`,
    components: {
        "ex-context-menu" : ContextMenuComponent
    }
})
export default class FileComponent extends Vue {

	@Prop({required: true})
    id: string;

    @Prop({required: true})
    file: File;

	@Prop()
	dragLimitSelector: string;

	@Prop({required: false})
    left: number;

    @Prop({required: false})
    top: number;

    @Prop({required: true})
    rootId: string;
	
	@Prop({required: false})
	selected: boolean;

    draggable: Draggable = null;
    dependencyInjection: DependencyInjector = null;
    
	fileSelected: boolean = false;
    cmTop: number = 0;
    cmLeft: number = 0;
    showContextMenu: boolean = false;
	
	@Watch('file', {deep: true})
    onFileChange(file: File) {
		if(file.renaming === true){
			setTimeout(() => document.getElementById('rename_' + file.id).focus(), 100);
		}		
	}

	@Watch('fileSelected')
    onFileSelectedChange(val, old) {
		if(this.fileSelected) {
			this.$emit('select', this.file);
		} else {
			this.$emit('deselect', this.file);
		}
		this.$emit('update:selected', val);
	}

	@Watch('selected')
    onSelectedChange(val, old) {
		this.fileSelected = val;
	}	
	
    mounted() {
        this.dependencyInjection = new DependencyInjector();
		this.draggable = this.dependencyInjection.getContainer().resolve(Draggable);
		this.draggable.el = document.querySelector("#" + this.id);
        this.draggable.limit = document.querySelector(this.dragLimitSelector);
        this.draggable.explorerId = this.rootId;
		this.draggable.file = this.file;
		this.registerListeners();
        this.draggable.start();
        this.draggable.setCoord(this.left, this.top);
    }
	
	dblclick(e) {
		let opt: Option = this.file.options.find(o => o._default);
		if(opt !== undefined){
			opt.callback(e, this.file);
		}else{
			this.file.options[0].callback(e, this.file);
		}		
	}
	
	updateFileName = _.debounce(function (file) {
		if(file.name.length === 0){
			file.name = "undefined";
		}
		store.dispatch('updateFile', {id: this.rootId, file: file});
	}, 500);
	
	contextMenu(e){
		document.dispatchEvent(new Event('closeAllContextMenu'));
        this.cmTop = e.clientY;
        this.cmLeft = e.clientX;
        this.fileSelected = true;
        setTimeout(() => this.showContextMenu = true, 30);
    }

    registerListeners() {
        document.addEventListener("click", (e) => {
            this.fileSelected = false;
        });
    }

    get icon () {
        return 'fa-' + this.file.icon;
    }    
}