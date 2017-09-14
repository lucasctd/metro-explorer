import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    template: `<div>
                    <div class="explorer-modal" v-show="showModal"></div>
                    <transition name="explorer-fade">
                        <div class="explorer-dialog" v-show="showDialog" :style="{ width: width + 'px', height: height + 'px'}">
                            <span class="fa fa-times-circle close-icon fa-2x" :style="{opacity: opacity}" title="Close" @click="showModal = showDialog = false" 
                                @mouseover="onMouseOverCloseIcon" @mouseleave="onMouseOutCloseIcon" v-show="closable"></span>
                            <div class="content">
                                <slot></slot>
                            </div>
							<slot name="footer"></slot>
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
    opacity: number = 1;
	
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
	}

    onMouseOverCloseIcon(){
	    this.opacity = .5;
    }

    onMouseOutCloseIcon(){
        this.opacity = 1;
    }
}