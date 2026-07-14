<template>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div class="aspect-square bg-gray-200"></div>
    <div class="p-3 space-y-2">
      <div class="h-3 w-16 bg-gray-200 rounded"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      <div class="flex items-center gap-1">
        <div class="h-3 w-3 bg-gray-200 rounded-full" v-for="i in 5" :key="i"></div>
        <div class="h-3 w-8 bg-gray-200 rounded ml-1"></div>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-5 w-20 bg-gray-200 rounded"></div>
        <div class="h-4 w-14 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
</template>
