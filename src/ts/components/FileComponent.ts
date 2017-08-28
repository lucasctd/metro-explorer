import Vue from 'vue';
import File from '../interfaces/File';
import Draggable from '../interfaces/Draggable';
import ContextMenuComponent from '../components/ContextMenuComponent';
import {DependencyInjection} from '../huject.config';
import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '../state/AppState';

@Component({
    template: `<div :id="'ex_' + file.id" class="explorer-file" @click.stop="selected = !selected" @contextmenu.prevent="contextMenu" :style="{top: top + 'px', left: left + 'px'}">
                    <div v-show="selected" class="file-selected"></div>
                    <div class="icon-area">
                        <i class="fa fa-4x icon" :class="icon"></i>
                        <p class="file-name">{{file.name}}</p>
                    </div>
                    <ex-context-menu :show.sync="showContextMenu" :top="cmTop" :left="cmLeft" :options="file.options" :file="file"></ex-context-menu>
               </div>`,
    components: {
        "ex-context-menu" : ContextMenuComponent
    }
})
export default class FileComponent extends Vue {

    @Prop()
    file: File;

	@Prop()
	dragLimitSelector: string;

	@Prop()
    left: number;

    @Prop()
    top: number;
	
    draggable: Draggable = null;
    dependencyInjection: DependencyInjection = null;

    selected: boolean = false;
    cmTop: number = 0;
    cmLeft: number = 0;
    showContextMenu: boolean = false;
	
    mounted(){
        this.dependencyInjection = new DependencyInjection();
		this.draggable = this.dependencyInjection.getContainer().resolve(Draggable);
		this.draggable.el = document.querySelector("#ex_" + this.file.id);
		this.draggable.limit = document.querySelector(this.dragLimitSelector);
		this.registerListeners();
        this.draggable.start();
        this.draggable.setCoord(this.left, this.top);        
    }

    get icon () {
        return 'fa-' + this.file.icon;
    }

    contextMenu(e){
        this.cmTop = e.clientY - 10;
        this.cmLeft = e.clientX - 10;
        this.showContextMenu = true;
    }

    registerListeners() {
        const that = this;
        document.addEventListener("click", (e) => {
            this.selected = false;
        });
    }

    delete (file: File): void {
		store.dispatch('deleteFile', file);
	}
	
	move (file: File): void	{
		
	}
	
	rename (file: File): void {
		
	}
	
	show (file: File): void {

	}
}