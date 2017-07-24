import Vue from 'vue';
import { Component, Inject, Model, Prop, Watch, Provide } from 'vue-property-decorator'
// The @Component decorator indicates the class is a Vue component
@Component({
    // All component options are allowed in here
    template: `<div class="explorer-context-menu">
                   <p>Edit</p>
                   <p>Rename</p>
                   <p>Delete</p>
               </div>`
})
export default class FileComponent extends Vue {
    // Initial data can be declared as instance properties
    @Prop({default: false})
    show: boolean;
}