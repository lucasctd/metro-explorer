import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    template: `<div>
                    <div class="explorer-modal" v-show="showModal"></div>
                    <transition name="explorer-fade">
                        <div class="explorer-dialog" v-show="showDialog" :style="{ width: width + 'px', height: height + 'px', top: top + 'px', left: left + 'px'}">
                            <span class="fa fa-times-circle close-icon fa-2x" title="Close" @click="closeDialog" v-show="closable"></span>
                            <div class="header"> 
                                <span class="fa fa-times-circle close-icon fa-2x" title="Close" @click="closeDialog" v-show="closable"></span> 
                            </div> 
                            <div class="content" :style="{height: contentHeight + 'px'}"> 
                                <slot></slot> 
                            </div> 
                            <div class="footer"> 
                                <slot name="footer"></slot> 
                            </div>
                       </div>
                    </transition>
                </div>`
})
export default class DialogComponent extends Vue {

    @Prop({'default': false})
    show: boolean;

    @Prop({'default': true})
    closable: boolean;

    @Prop({'default': true})
    modal: boolean;

    @Prop({'default': 500})
    width: number;

    @Prop({'default': 300})
    height: number;

    showDialog: boolean = false;
    showModal: boolean = false;
    top: number = null;
    left: number = null;
    contentHeight: number = 0;

    @Watch('show')
	onShowChange(val: boolean, oldVal: boolean) {
        this.showDialog = val;
	}

    @Watch('showDialog')
    onShowDialogChange(val: boolean, oldVal: boolean) {
        this.$emit('update:show', val)
    }

    mounted(){
        this.showDialog = this.show;
        this.showModal = this.modal && this.show;
        this.contentHeight = this.height - 40 - 55;//dialog's height minus content's top minus footer's height
        this.top = (window.innerHeight - this.height - 100) / 2;
        this.left = window.innerWidth / 2 - this.width / 2;
    }

    closeDialog() {
        this.showModal = false;
        this.showDialog = false;
    }
}