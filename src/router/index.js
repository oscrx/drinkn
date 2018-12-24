import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/HelloWorld'
import Aanbiedingen from '@/components/aanbiedingen'
import Login from '@/components/login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/aanbiedingen',
      name: 'aanbiedingen',
      component: Aanbiedingen
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
