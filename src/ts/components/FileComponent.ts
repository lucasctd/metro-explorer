import Vue from 'vue';
import File from '../interfaces/File';
import Draggable from '../interfaces/Draggable';
import ContextMenuComponent from '../components/ContextMenuComponent';
import {Inject} from 'huject';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    template: `<div class="explorer-file" @click="selected = !selected" @contextmenu="contextMenu">
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

    @Inject
    draggable: Draggable = null;

    selected: boolean = false;
    cmTop: number = 0;
    cmLeft: number = 0;
    showContextMenu: boolean = false;

    constructor() {
        super();
        console.log(this.draggable);
        console.log("build FileComponent");
    }

    mounted(){
        console.log("mount");
        console.log(this.draggable);
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