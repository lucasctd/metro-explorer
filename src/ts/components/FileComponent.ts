import Vue from 'vue';
import File from '../interfaces/File';
import Draggable from '../interfaces/Draggable';
import ContextMenuComponent from '../components/ContextMenuComponent';
import {container} from '../huject.config';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    template: `<div :id="'ex_' + file.id" class="explorer-file" @click="selected = !selected" @contextmenu="contextMenu">
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
	
    draggable: Draggable = null;

    selected: boolean = false;
    cmTop: number = 0;
    cmLeft: number = 0;
    showContextMenu: boolean = false;
	
    mounted(){
		this.draggable = container.resolve(Draggable);
		this.draggable.el = document.querySelector("#ex_" + this.file.id);
		this.draggable.limit = document.querySelector(this.dragLimitSelector);
		this.draggable.start();
    }

    get icon () {
        return 'fa-' + this.file.icon;
    }

    contextMenu(e){
        this.cmTop = e.clientY - 10;
        this.cmLeft = e.clientX - 10;
        this.showContextMenu = true;
    }
}