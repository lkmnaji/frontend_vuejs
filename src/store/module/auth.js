// import { resolve } from 'core-js/fn/promise'
import Api from '../../api/Api'
const auth = {
    namespaced: true, 
    state: {
        token: localStorage.getItem('token') || '',

        user: JSON.parse(localStorage.getItem('user')) || {},
    },
    mutations: {
        AUTH_SUCCESS(state, token, user) {
            state.token = token
            state.user = user
        },

        GET_USER(state, user) {
            state.user = user
        },

        AUTH_LOGOUT(state) {
            state.token = ''
            state.user  = {}
        }
    },

    actions: {
        register: {
            register({commit}, user){
                return new Promise((resolve,reject) =>{
                    Api.post('/register', {
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        password_confirmation: user.password_confirmation
                    })

                    .then(response => {
                        const token = response.data.token
                        const user = response.data.user

                        localStorage.setItem('token', token)
                        localStorage.setItem('user', JSON.stringify(user))

                        Api.defaults.headers.common['Authorization'] = "Bearer" + token

                        commit ('AUTH_SUCCESS', token, user)

                        resolve(response)
                    }).catch(error => {
                        localStorage.removeItem('token')
                        reject(error.response.data)
                    })
                })
            },

            getUser({commit}) {
                const token = localStorage.getItem('token')
                Api.defaults.headers.common['Authorization'] = "Bearer" + token
                Api.get('/user')
                .then(response => {
                    commit('GET_USER', response.data.user)
                })
            }, 

            logout({commit}) {
                return new Promise((resolve) => {
                    commit("AUTH_LOGOUT")
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')

                    delete Api.defaults.headers.common['Authorization']

                    resolve()
                })
            },

            login({commit}, user) {
                return new Promise((resolve, reject) => {
                    Api.post('/login', {
                        email: user.email,
                        password: user.password
                    })
                    .then(response => {
                        const token = response.data.token
                        const user = response.data.user

                        localStorage.setItem('token', token)
                        localStorage.setItem('user', JSON.stringify(user))

                        Api.defaults.headers.common['Authorization'] = "Bearer" + token

                        commit('AUTH_SUCCESS', token, user)
                        commit("GET_USER", user)

                        Api.get('/cart')
                        .then(response => {
                            commit('cart/GET_CART', response.data.cart, {root:true})
                        })

                        Api.get('/cart/total')
                        .then(response => {
                            commit('cart/CART_TOTAL', response.data.total, {root:true})
                        })
                        resolve(response)
                    }).catch(error => {
                        localStorage.removeItem('token')
                        reject(error.response.data)
                    })
                })
            }
        }
    },

    getters:{
        currentUser(state) {
            return state.user
        },

        isLoggedIn(state) {
            return state.token
        }
    }
}

export default auth