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
      <div class='filter-row'>
        <v-row>
          <v-col cols="1">
            Filter
          </v-col>
          <v-col cols="3">
            <v-select
              v-model="filter.month"
              density="compact"
              :items="monthList"
              item-title="name"
              item-value="value"
              @update:modelValue="triggerFilterChange"
            ></v-select>
          </v-col>
        </v-row>
      </div>
      <v-table
        density="compact"
        v-if="transactions?.length"
        fixed-header
        height="80vh"
      >
        <thead>
          <tr>
            <th class="text-left">Date</th>
            <th class="text-left">Desc</th>
            <th class="text-left">Category</th>
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
              <span>
                <v-select
                  v-model="item.category"
                  density="compact"
                  :items="categoryList"
                  item-title="name"
                  item-value="name"
                  variant="underlined"
                  @update:modelValue="updateCategory($event, item)"
                ></v-select>
              </span>
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
      filter: {
        month: moment().month() + 1,
      },
      monthList: [],
      file: null,
      transactions: [],
      uploadTransactionLoading: false,
      categoryList: [
        { name: "Food" },
        { name: "Snacks" },
        { name: "Travel" },
        { name: "Swamy" },
        { name: "Rent" },
        { name: "Maintenance" },
        { name: "Grocery" },
        { name: "Gas" },
        { name: "Electricity" },
        { name: "Communication" },
        { name: "Internet" },
        { name: "Fuel" },
        { name: "Medicals" },
        { name: "Gym" },
        { name: "Shopping" },
        { name: "Clothing" },
        { name: "Entertainment" },
        { name: "Festivals" },
        { name: "Investments" },
        { name: "Insurance" },
        { name: "Credit Card" },
        { name: "Loan" },
        { name: "Others" },
        { name: "Transfer" },
        { name: "Salary" },
      ],
    });
    const formatDate = computed(() => {
      return (date) => {
        return moment(date).format("DD/MM/YY");
      };
    });
    async function updateCategory(value, item) {
      try {
        await appStore.updateCategory(item._id, value);
      } catch (error) {
        console.log("error", error);
      }
    }
    function upload() {
      fileInput.value.click();
    }
    async function triggerConversion(params) {
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
          const filter = computeFilter();
          const allTransactions = await appStore.getAllTransactions(filter);
          state.transactions = allTransactions;
        }
        state.uploadTransactionLoading = false;
        console.log("error", error.value);
      }, 3000);
    }
    function populateMonthFilter () {
      const months = [];
      months.push({name: moment().format('MMM YYYY'), value: moment().month() + 1});
      months.push({name: moment().subtract(1, 'months').format('MMM YYYY'), value: moment().subtract(1, 'months').month() + 1});
      months.push({name: moment().subtract(2, 'months').format('MMM YYYY'), value: moment().subtract(2, 'months').month() + 1});
      state.monthList = months;
    }

    function computeFilter() {
      const filter = {};
      if (state.filter.month) {
        filter.from = moment().month(state.filter.month -1).date(0).toISOString();
        filter.to = moment().month(state.filter.month).date(0).toISOString();
      }
      return filter;
    }
    async function triggerFilterChange() {
      populateMonthFilter();
      const filter = computeFilter();
      const response = await appStore.getAllTransactions(filter);
      state.transactions = response;
    }
    onMounted(async () => {
      populateMonthFilter();
      const filter = computeFilter();
      const response = await appStore.getAllTransactions(filter);
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
      updateCategory,
      triggerFilterChange,
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
