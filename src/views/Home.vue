<template>
  <v-row>
    <v-col cols="11">
      <v-card class="pa-md-4 ma-lg-auto mx-auto">
        Your Transactions are here ⚡️
      </v-card>
    </v-col>
    <v-col cols="1">
      <v-card class="mx-auto">
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
  <v-row>
    <v-col cols="12">
      <v-table
        density="compact"
        v-if="transactions?.length"
        fixed-header
        height="80vh"
      >
        <thead>
          <tr>
            <th class="text-left">Date</th>
            <th class="text-left">Decs</th>
            <th class="text-left">Type</th>
            <th class="text-left">Debit</th>
            <th class="text-left">Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in transactions" :key="item.name">
            <td>{{ formatDate(item.date) }}</td>
            <td>
              {{
                item.merchant && item.message
                  ? `${item.merchant} - ${item.message}`
                  : item.desc
              }}
            </td>
            <td>
              {{ item.type || "Other" }}
            </td>
            <td class="font-weight-bold text-red">
              {{ item.debit }}
            </td>
            <td class="font-weight-bold text-green">
              {{ item.credit }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card v-else-if="uploadTransactionLoading" class="empty-transactions">
        Loading Please wait
      </v-card>
      <v-card v-else class="empty-transactions">
        Upload Transactions to see the magic here🪄...
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, toRefs, ref, onMounted, computed } from "vue";
import { useConvertUtils } from "@/composables/utils";
import { useAppStore } from "@/store/app";
import moment from "moment";
export default {
  setup() {
    const appStore = useAppStore();
    const { data, error, convertCsvFromFileToJson, convertCsvToJson } =
      useConvertUtils();
    const fileInput = ref(null);
    const state = reactive({
      file: null,
      transactions: [],
      uploadTransactionLoading: false,
    });
    const formatDate = computed(() => {
      return (date) => {
        return moment(date).format("DD/MM/YY");
      };
    });
    function upload() {
      console.log("hit");
      fileInput.value.click();
    }
    async function triggerConversion(params) {
      console.log("params", params);
      state.uploadTransactionLoading = true;
      let reader = new FileReader();
      let content;
      reader.readAsBinaryString(params[0]);
      reader.onload = (evt) => {
        content = reader.result;
      };
      setTimeout(async () => {
        console.log("wait over");
        await convertCsvToJson(content);
        if (!error.value) {
          await appStore.uploadTransactions(data.value);
          const allTransactions = await appStore.getAllTransactions();
          state.transactions = allTransactions;
        }
        state.uploadTransactionLoading = false;
        console.log("error", error.value);
      }, 3000);
    }
    onMounted(async () => {
      const response = await appStore.getAllTransactions();
      state.transactions = response;
    });

    return {
      ...toRefs(state),
      fileInput,
      data,
      error,
      formatDate,
      upload,
      triggerConversion,
      convertCsvFromFileToJson,
    };
  },
};
</script>

<style lang="scss" scoped>
.empty-transactions {
  height: 300px;
  padding: 20px;
  font-size: 20px;
  text-align: center;
}
</style>
