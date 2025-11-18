<script lang="ts" setup>
import { ref } from 'vue'
const successMessage = ref('')

const emit = defineEmits(['update'])

function defineSuccessMessage() {
  successMessage.value = "Hello c'est un succes"
  emit('update', successMessage.value)
}
</script>

<template>
  <div>
    <button class="bg-blue-600 p-4" @click="defineSuccessMessage">Define message</button>
  </div>
</template>
