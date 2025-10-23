<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
async function auth(event: Event) {
  event.preventDefault()
  console.log('username', username.value)
  console.log('password', password.value)
}
</script>

<template>
  <h1>Login</h1>
  <form @submit="auth">
    <label for="username">Username: </label>
    <input id="username" placeholder="enter your username " v-model="username" />
    <label for="password">Password: </label>
    <input id="password" type="password" placeholder="************" v-model="password" />
    <button type="submit">Login</button>
  </form>
</template>
