import Vue from 'vue';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';
import {Option} from '../interfaces/Option';
import File from "../interfaces/File";

@Component({
    template: `<div class="explorer-context-menu" v-show="show" :style="{ top: top + 'px', left: left + 'px'}" @click.stop="">
                    <div class="box">
                        <div class="option" v-for="option in options" @click.stop="option.callback($event, file)">
                            <a href="javascript:void(0)">{{option.name}}</a>
                        </div>
                    </div>
               </div>`
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
}