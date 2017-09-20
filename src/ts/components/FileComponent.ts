import Vue from 'vue';
import File from '../interfaces/File';
import Draggable from '../interfaces/Draggable';
import ContextMenuComponent from '../components/ContextMenuComponent';
import {DependencyInjector} from '../huject.config';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../state/AppState';
import * as _ from "lodash";

@Component({
    template: `<transition name="explorer-fade">
				<div :id="'ex_' + file.id" class="explorer-file" v-show="file.visible" @click.stop="click" @contextmenu.prevent.stop="contextMenu" :style="{top: top + 'px', left: left + 'px'}">
                    <div v-show="selected" class="file-selected"></div>
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
    file: File;

	@Prop()
	dragLimitSelector: string;

	@Prop()
    left: number;

    @Prop()
    top: number;

    @Prop({required: true})
    rootId: string;

    draggable: Draggable = null;
    dependencyInjection: DependencyInjector = null;

    selected: boolean = false;
    cmTop: number = 0;
    cmLeft: number = 0;
    showContextMenu: boolean = false;
	
	@Watch('file', {deep: true})
    onFileChange(file: File) {
		if(file.renaming === true){
			setTimeout(() => document.getElementById('rename_' + file.id).focus(), 100);
		}		
	}	
	
    mounted() {
        this.dependencyInjection = new DependencyInjector();
		this.draggable = this.dependencyInjection.getContainer().resolve(Draggable);
		this.draggable.el = document.querySelector("#ex_" + this.file.id);
        this.draggable.limit = document.querySelector(this.dragLimitSelector);
        this.draggable.rootId = this.rootId;
		this.registerListeners();
        this.draggable.start();
        this.draggable.setCoord(this.left, this.top);        
    }
	
	click() {
		this.selected = !this.selected;
		if(this.selected) {
			store.dispatch('updateFile', file);
		}
	}
	
	updateFileName = _.debounce(function (file) {
		store.dispatch('updateFile', file);
	}, 500);
	
	contextMenu(e){
		document.dispatchEvent(new Event('closeAllContextMenu'));
        this.cmTop = e.clientY;
        this.cmLeft = e.clientX;
        setTimeout(() => this.showContextMenu = true, 30);
    }

    registerListeners() {
        const that = this;
        document.addEventListener("click", (e) => {
            this.selected = false;
        });
    }

    get icon () {
        return 'fa-' + this.file.icon;
    }    
}