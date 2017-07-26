import Vue from 'vue';
import File from '../interfaces/File';
import FileComponent from '../components/FileComponent';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator';

@Component({
    template: `<div class="explorer-file">
                   <ex-file v-for="file in files" :key="file.id" :file="file"></ex-file>
               </div>`,
    components: {
        "ex-file" : FileComponent
    }
})
export default class ExplorerComponent extends Vue {

    @Prop()
    files: Array<File>;
}