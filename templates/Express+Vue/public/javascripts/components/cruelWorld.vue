<template>
  <div id="login" v-if="seen">
    <h1>Login</h1>
    <input type="text" name="username" v-model="input.nickName" placeholder="Nick" />
    <button type="button" @click="setNick()">Set nickname</button>
  </div>
</template>

<script>
module.exports = {
  name: "Thinf",
  data() {
    return {
      input: {
        nickName: ""
      },
      seen: true
    };
  },
  methods: {
    setNick() {
      socket.emit("setNick", this.input.nickName);
      this.seen = false;
      this.$emit("showGameF");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
