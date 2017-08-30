import Vue from 'vue';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';
import {Option} from '../interfaces/Option';
import File from "../interfaces/File";

@Component({
    template: `<transition name="explorer-fade">
                    <div class="explorer-context-menu" v-show="showMenu" :style="{ top: top + 'px', left: left + 'px'}">
                        <div class="box">
                            <div v-if="option.visible" class="option" :class="{disabled: option.disabled}" v-for="option in options" @click.stop="callback($event, option)">
                                <a href="javascript:void(0)">{{option.name}}</a>
                            </div>
                        </div>
                   </div>
                </transition>`
})
export default class ContextMenuComponent extends Vue {

    @Prop({default: false})
    show: boolean;

    @Prop()
    top: number;

    @Prop()
    left: number;

    @Prop()
    options: Array<Option>;

    @Prop()
    file: File;

    showMenu: boolean = false;
	
	@Watch('show')
	onShowChanged(val: boolean, oldVal: boolean) {
        this.showMenu = val;
	}

    @Watch('showMenu')
    onShowMenuChange(val: boolean, oldVal: boolean) {
        this.$emit('update:show', val)
    }
	
	mounted(){
		this.registerListeners();
	}
	
	callback(e, option: Option){
        if(!option.disabled){
            this.showMenu = false;
            option.callback(e, this.file);
        }
	}
	
	registerListeners() {
	    const that = this;
		document.addEventListener("click", (e) => {
            that.showMenu = false;
		});
		
		document.addEventListener("closeAllContextMenu", (e) => {
            that.showMenu = false;
		});
	}
	
}