<script setup lang="ts">
import NavbarComponent from '@/components/NavbarComponent.vue'
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
  <NavbarComponent />

  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <form @submit="auth">
        <label for="username">Username: </label>
        <input id="username" placeholder="enter your username " v-model="username" />
        <label for="password">Password: </label>
        <input id="password" type="password" placeholder="************" v-model="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  </div>
</template>
