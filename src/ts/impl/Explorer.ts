
import ExplorerComponent from '../components/ExplorerComponent';
import File from '../interfaces/File';
import {File as FileImpl} from './File';
import Vue from '../Vue';
import store from '../state/AppState';

class Explorer extends Vue{

	private id: string;
	private vue: Vue;
    public files: Array<File>;

	constructor(id: string) {
		super();
		this.id = id;
		
		store.dispatch('setFiles', data);
        this.vue = new Vue({
			el: this.id,
			store,
            components: {
                "ex-plorer": ExplorerComponent
            }
		});
	}
}

export {Explorer};
export default Explorer;