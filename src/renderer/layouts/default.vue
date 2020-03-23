<template>
  <div>
    <!-- <app-header /> -->
    <nuxt />
  </div>
</template>

<script>
import appHeader from '@/components/header'
export default {
  components: { appHeader }
}
</script>

<style>
html, body {
  margin: 0 !important;
  background: black;
  color: white;
}
</style>
