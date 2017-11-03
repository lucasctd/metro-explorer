/**
 * Created by lucas on 03/31/2017.
 */

import {Vuex} from "../Vue";

export default new Vuex.Store({
    state: {
        data: []
    },
    mutations: {
        SET_FILES(state, payload){
            state.data.find(d => d.id === payload.id).files = payload.files;
        },
        SET_WIDTH(state, payload){
            state.data.find(d => d.id === payload.id).width = payload.explorerWidth;
        },
        UPDATE_FILE(state, payload){
          state.data.find(d => d.id === payload.id).files.forEach(f => {
                if(f.id === payload.file.id){
                    f = payload.file;
                }
            })
        },
        DELETE_FILE(state, payload){
            state.data.find(d => d.id === payload.id).files = state.data.find(d => d.id === payload.id).files.filter(f => f.id !== payload.file.id);
        },
		    ADD_EXPLORER_DATA(state, data){
            state.data.push(data);
        },
        ADD_FILE(state, payload){
            state.data.find(d => d.id === payload.id).files.push(payload.file);
        },
    },
    actions: {
        setFiles({commit}, payload) {
            commit('SET_FILES', payload);
        },
        updateFile({commit}, payload) {
            commit('UPDATE_FILE', payload);
        },
        setWidth({commit}, payload) {
            commit('SET_WIDTH', payload);
        },
        deleteFile({commit}, payload) {
            commit('DELETE_FILE', payload);
        },
        addExplorerData({commit}, data) {
            commit('ADD_EXPLORER_DATA', data);
        },
        addFile({commit}, payload) {
            commit('ADD_FILE', payload);
        },
    },
	getters: {
        getFileById(state) {
          return id => {
            let list = state.data.find(d => d.id === payload.id).files.filter(f => f.id === id);
            return list.length > 0 ? list[0] : null;
          }
        },
        getFiles(state) {
            return id => {
                const obj = state.data.find(d => d.id === id);
                return obj ? obj.files : null;
            }
        },
        getWidth(state) {
            return id => {
                return state.data.find(d => d.id === id).width;
            }
        },
	}
})
