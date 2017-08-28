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
        UPDATE_FIELD(state, params){
            state.files.forEach(f => {
                if(f.id === params.id){
                    f.field = params.field;
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
        updateField({commit}, params){
            commit('UPDATE_FIELD', params);
        },
        setNumGridX({commit}, value){
            commit('SET_NUM_GRID_X', value);
        },
        deleteFile({commit}, file){
            commit('DELETE_FILE', file);
        }
    }
})
