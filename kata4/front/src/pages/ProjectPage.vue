<script lang="ts" setup>
import CreateProjectForm from '@/components/project/CreateProjectForm.vue'

function handleUpdateMessage(val: string) {
  console.log('new val -> ', val)
}
</script>

<template>
  <h1>Create Project</h1>
  <CreateProjectForm @update="handleUpdateMessage" />
</template>
