<template>
  <v-row>
    <v-col cols="6">
      <v-card class="pa-md-4 ma-lg-auto mx-auto">
        <v-file-input
          ref="fileInput"
          class="d-none"
          label="File input"
          variant="solo"
          v-mode="file"
          @update:modelValue="triggerConversion"
        ></v-file-input>
        <v-btn @click="upload">Upload</v-btn>
      </v-card>
    </v-col>
  </v-row>
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left">Narration</th>
        <th class="text-left">Debit Amount</th>
        <th class="text-left">Credit Amount</th>
        <th class="text-left">Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" :key="item.name">
        <td>{{ item.Narration }}</td>
        <td>{{ item["Debit Amount"] }}</td>
        <td>{{ item["Credit Amount"] }}</td>
        <td>{{ item["Date"] }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
import { reactive, toRefs, ref } from "vue";
import { useConvertUtils } from "@/composables/utils";
export default {
  setup() {
    const { data, error, convertCsvFromFileToJson, convertCsvToJson } =
      useConvertUtils();
    const fileInput = ref(null);
    const state = reactive({
      file: null,
    });
    function upload() {
      console.log("hit");
      fileInput.value.click();
    }
    async function triggerConversion(params) {
      console.log("params", params);
      let reader = new FileReader();
      let content;
      reader.readAsBinaryString(params[0]);
      reader.onload = (evt) => {
        content = reader.result;
      };
      setTimeout(async () => {
        console.log("wait over");
        await convertCsvToJson(content);
        console.log("data", data.value);
        console.log("error", error.value);
      }, 3000);
    }
    return {
      ...toRefs(state),
      fileInput,
      data,
      error,
      upload,
      triggerConversion,
      convertCsvFromFileToJson,
    };
  },
};
</script>

<style lang="scss" scoped></style>
