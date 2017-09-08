import Vue from 'vue';
import { Component, Prop, Watch} from 'vue-property-decorator';
import {Option} from '../interfaces/Option';
import File from "../interfaces/File";

@Component({
    template: `<transition name="explorer-fade">
                    <div class="explorer-context-menu" v-show="showMenu" :style="{ top: topPx + 'px', left: leftPx + 'px'}">
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
    leftPx: number = 0;
    topPx: number = 0;
	
	@Watch('show')
	onShowChanged(val: boolean, oldVal: boolean) {
        this.showMenu = val;
	}

    @Watch('showMenu')
    onShowMenuChange(val: boolean, oldVal: boolean) {
        this.$emit('update:show', val)
    }

    @Watch('left')
    onLeftChange(val: number, oldVal: number) {
	    const explorerWidth: number = Number(document.getElementById('explorer-component').style.width.replace('px', ''));
        const cmWidth = Number(this.$el.getBoundingClientRect().width);
	    if(explorerWidth - val < cmWidth){
	        this.leftPx = val - cmWidth;
        }else{
            this.leftPx = val;
        }
    }

    @Watch('top')
    onTopChange(val: number, oldVal: number) {
        const explorerHeight: number = Number(document.getElementById('explorer-component').style.height.replace('px', ''));
        const cmHeight = this.$el.getBoundingClientRect().height;
        if(explorerHeight - val < cmHeight){
            this.topPx = val - cmHeight;
        }else{
            this.topPx = val;
        }
    }
	
	mounted(){
		this.registerListeners();
		this.leftPx = this.left;
	}
	
	callback(e, option: Option){
        if(!option.disabled){
            this.showMenu = false;
            option.callback(e, this.file);
        }
	}
	
	registerListeners() {
	    const that = this;
		document.addEventListener("closeAllContextMenu", (e) => {
            that.showMenu = false;
		});

        document.addEventListener("click", (e) => {
            that.showMenu = false;
        });
	}
	
}