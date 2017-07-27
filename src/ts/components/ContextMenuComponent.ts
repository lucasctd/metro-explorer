import Vue from 'vue';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';
import {Option} from '../interfaces/Option';
import File from "../interfaces/File";

@Component({
    template: `
                <transition name="explorer-fade">
                    <div class="explorer-context-menu" v-show="showMenu" :style="{ top: top + 'px', left: left + 'px'}" @click.stop="">
                        <div class="box">
                            <div class="option" v-for="option in options" @click.stop="option.callback($event, file)">
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
    onShowMenuChanged(val: boolean, oldVal: boolean) {
        this.$emit('update:show', val)
    }
	
	mounted(){
		this.registerListeners();
	}
	
	registerListeners() {
	    const that = this;
		document.addEventListener("click", (e) => {
            that.showMenu = false;
		});
	}
	
}