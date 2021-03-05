import firebase from 'firebase'


export const state = () => ({
    user: {
        uid: null,
        name: null,
        email: null,
    },
    ready: false,
    windowSize: {x: 0, y: 0},
    isLogin: '',
})
export const getters = {
    user: state => {
        return state.user
    },
    windowSize: state => {
        return state.windowSize
    },
}
export const mutations = {
    getData (state, payload) {
        state.user.uid = payload.uid
        state.user.name = payload.name
        state.user.email = payload.email
    },
    ready (state, payload) {
        state.ready = payload
    },
    windowSize(state,size){
        state.windowSize = size;
    },
    isLogin(state,payload){
        state.isLogin = payload
    }
}
export const actions = {
    login({ dispatch, commit }, payload) {
        firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(user => {
            console.log('hello')
            firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                commit('getData', { uid: user.uid, name: user.displayName, email: user.email })
            }
            commit('isLogin',true)
            console.log(user)
        })

        }).catch((error) => {
            alert(error)
        })
    },
    logout({ commit }) {
        commit('getData', { uid: null, name: null, email: null });
        commit('isLogin',false)
    },
    async loadUser({commit, dispatch}){
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                commit('getData', { uid: user.uid, name: user.displayName, email: user.email })
            }
            // if (user) {
            //     const db = firebase.firestore();
            //     db.collection(`users`).doc(user.uid).get().then(query => {
            //         commit('getData', { uid: user.uid, name: query.data().name, email: user.email })
            //     })
            // }
        })
    },
}