<template>
  <v-row>
    <v-col cols="11">
      <v-card class="pa-md-4 ma-lg-auto mx-auto">
        Analyse
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
    </v-col>
  </v-row>
  <v-row>
    <v-col
      v-for="(value,key) in transactions"
     :key="key">
      <div
        >
        <div>
          {{ key }}
        </div>
        <div>
          <div v-for="(val, idx) in value" :key="idx">
            {{ val.debit === '0.00' ? val.credit : val.debit}}
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import {useAppStore} from "@/store/app";
import {computed, onMounted, reactive, ref, toRefs} from "vue";
import moment from "moment";

export default {
  name: 'analyse-data',
  setup() {
    const appStore = useAppStore();
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
      state.transactions = await appStore.getAnalysedDataByCategory(filter);
    }
    onMounted(async () => {
      populateMonthFilter();
      const filter = computeFilter();
      state.transactions = await appStore.getAnalysedDataByCategory(filter);
    });

    return {
      ...toRefs(state),
      fileInput,
      formatDate,
      triggerFilterChange,
    };
  },
};
</script>
<style scoped lang="scss">

</style>
