<template>
  <v-row>
    <v-col cols="6">
      <v-card class="pa-md-4 ma-lg-auto mx-auto">
        <v-btn>Upload</v-btn>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, toRefs } from "vue";

export default {
  setup() {
    const state = reactive({});

    return {
      ...toRefs(state),
    };
  },
};
</script>

<style lang="scss" scoped></style>
