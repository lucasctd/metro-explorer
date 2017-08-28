/**
 * Created by lucas on 03/31/2017.
 */

import {Vuex} from "../Vue";

export default new Vuex.Store({
    state: {
        files: [],
        numGridX: 5
    },
    mutations: {
        SET_FILES(state, files){
            state.files = files;
        },
        SET_NUM_GRID_X(state, value){
            state.numGridX = value;
        },
        UPDATE_FILE(state, file){
            state.files.forEach(f => {
                if(f.id === file.id){
                    f = file;
                }
            })
        },
        DELETE_FILE(state, file){
            state.files = state.files.filter(f => f.id !== file.id);
        }
    },
    actions: {
        setFiles({commit}, files){
            commit('SET_FILES', files);
        },
        updateFile({commit}, file){
            commit('UPDATE_FILE', file);
        },
        setNumGridX({commit}, value){
            commit('SET_NUM_GRID_X', value);
        },
        deleteFile({commit}, file){
            commit('DELETE_FILE', file);
        }
    },
	getters: {
		getFileById(state, id) {
			let list = state.files.filter(f => f.id === id);
			return list.length > 0 ? list[0] : null;
		}
	}
})
