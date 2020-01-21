var Vue = require("vue/dist/vue.js");

Vue.component("cruel-world", require("./components/cruelWorld.vue"));

const app = new Vue({
    el: "#app"
});