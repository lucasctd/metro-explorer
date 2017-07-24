import Vue from 'vue';
import File from '../interfaces/File';
import ContextMenuComponent from '../components/ContextMenuComponent';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator'
// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `<div class="explorer-file" @click="selected = !selected" @contextmenu="showContextMenu">
                    <div v-show="selected" class="file-selected"></div>
                    <div class="icon-area">
                        <i class="fa fa-4x icon" :class="icon"></i>
                        <p class="file-name">{{file.name}}</p>
                    </div>
                    <slot></slot>
               </div>`
})
export default class FileComponent extends Vue {
    @Prop()
    file: File;
    @Provide()
    selected: boolean = false;

    get icon () {
        return 'fa-' + this.file.icon;
    }

    showContextMenu(){
        console.log("show")
    }

    components: {
        "ex-context-menu" : ContextMenuComponent
    }
}