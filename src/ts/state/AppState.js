/**
 * Created by lucas on 03/31/2017.
 */

import {Vuex} from "../Vue";

export default new Vuex.Store({
    state: {
        data: []
    },
    getDataById(id){
        return state.data.find(d => d.id === id);
    },
    mutations: {
        SET_FILES(state, payload){
            this.getDataById(payload.id).files = payload.files;
        },
        SET_NUM_GRID_X(state, payload){
            this.getDataById(payload.id).numGridX = payload.numGridX;
        },
        UPDATE_FILE(state, payload){
            this.getDataById(payload.id).files.forEach(f => {
                if(f.id === payload.file.id){
                    f = file;
                }
            })
        },
        DELETE_FILE(state, payload){
            this.getDataById(payload.id).files = this.getDataById(payload.id).files.filter(f => f.id !== payload.file.id);
        },
		ADD_EXPLORER_DATA(state, data){
            state.data.push(data);
        }
    },
    actions: {
        setFiles({commit}, payload){
            commit('SET_FILES', payload);
        },
        updateFile({commit}, payload){
            commit('UPDATE_FILE', payload);
        },
        setNumGridX({commit}, payload){
            commit('SET_NUM_GRID_X', payload);
        },
        deleteFile({commit}, payload){
            commit('DELETE_FILE', payload);
        },
        addExplorerData({commit}, data){
            commit('ADD_EXPLORER_DATA', data);
        }
    },
	getters: {
		getFileById(state) {
			return id => {
				let list = this.getDataById(payload.id).files.filter(f => f.id === id);
				return list.length > 0 ? list[0] : null;
			}			
        },
        getFiles(state) {
            return id => {
                return this.getDataById(payload.id).files;
            }
        }
	}
})
