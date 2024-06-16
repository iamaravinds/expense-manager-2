<template>
  <v-row>
    <v-col cols="11">
      <v-card class="pa-md-4 ma-lg-auto mx-auto">
        Analyse
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="10">
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
    <v-col cols="2"
    >
      <div v-if="!budget?.budget?.length">
        <v-btn @click="addBudget">
          Add Budget
        </v-btn>
      </div>
      <div v-else>
        <i>
          <small>Current Budget:</small>
        </i>
        {{formatDate(budget.date)}}
      </div>
    </v-col>
  </v-row>
<v-row>
  <v-col cols="6">
    <v-data-table
      :headers="headerData"
      :items="formattedTransactions"
      :items-per-page="0"
      item-value="value"
      density="compact"
    >
      <template v-slot:[`item.category`]="{item}">
        <span
          style="cursor: pointer"
          @click="getCategoryBasedItems(item.category)">
          {{ item.category }}
        </span>
      </template>
      <template v-slot:[`item.debit`]="{item}">
        <span
          style="cursor: pointer; font-weight: bold"
          @click="getCategoryBasedItems(item.category)">
          {{ item.debit }}
        </span>
      </template>
      <template v-slot:[`item.credit`]="{item}">
        <span
          style="cursor: pointer; font-weight: bold"
          @click="getCategoryBasedItems(item.category)">
          {{ item.credit }}
        </span>
      </template>
      <template v-slot:[`item.budget`]="{item}">
        <span
          style="cursor: pointer"
          class="budget-text"
          @click="getCategoryBasedItems(item.category)">
          {{ item.budget }}
        </span>
      </template>
      <template v-slot:[`item.net`]="{item}">
        <span
          style="cursor: pointer; font-weight: bold"
          @click="getCategoryBasedItems(item.category)"
        >
          {{ (item.net).toFixed(0) }}
          <v-icon
            v-if="item.net > item.budget"
            :icon="mdiArrowUp"
            class="red-text"
          />
          <v-icon
            v-else
            :icon="mdiArrowDown"
            class="green-text"
          />
        </span>

      </template>

      <template #bottom>
        <strong>
          Total Expense: {{ getTotalNet }}
        </strong>
      </template>
    </v-data-table>
  </v-col>
  <v-col cols="6" v-if="categoryTransactions.length">
    <div class="transaction-table">
      <h2>{{ categoryTransactions[0].category }}</h2>
      <div class="total-section">
        <h3>
          Debit: ₹ {{ getCategoryTotalDebit(categoryTransactions[0].category) }}
        </h3>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <h3>
          Credit: ₹ {{ getCategoryTotalCredit(categoryTransactions[0].category) }}
        </h3>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <h3 :class="{
          'green-text': (getCategoryTotalCredit(categoryTransactions[0].category)
        - getCategoryTotalDebit(categoryTransactions[0].category)) <=
            getBudgetVal(categoryTransactions?.[0]?.category)?.budget || 0,
          'red-text': (getCategoryTotalCredit(categoryTransactions[0].category)
        - getCategoryTotalDebit(categoryTransactions[0].category)) >
            getBudgetVal(categoryTransactions?.[0]?.category)?.budget || 0,
            }">
          Net : ₹ {{
            getCategoryTotalCredit(categoryTransactions[0].category)
              - getCategoryTotalDebit(categoryTransactions[0].category)
          }}
        </h3>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <h3>
          Budget : {{ getBudgetVal(categoryTransactions?.[0]?.category)?.budget }}
        </h3>
      </div>
      <v-data-table
        :headers="transactionHeaderData"
        :items="categoryTransactions"
        :items-per-page="0"
        item-value="value"
        density="compact"
      >
        <template #bottom></template>
        <template v-slot:[`item.date`]="{item}">
          {{ formatDate(item.date) }}
        </template>
      </v-data-table>
    </div>
  </v-col>
</v-row>
  <v-dialog width="500" v-model="openBudgetDialoge">
    <template #default>
      <v-card>
        <v-table>
          <thead>
          <tr>
            <th v-for="(item, headerIdx) in headers"
                :key="'header-' + headerIdx"
                class="text-left">
              <span @click="getCategoryBasedItems(item.category)">
                {{ item.title }}
              </span>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(item, valIdx) in categories"
            :key="'valIdx -' + valIdx"
          >
            <td @click="getCategoryBasedItems(item.category)">
              {{ item.category }}
            </td>
            <td>
              <v-text-field
                v-model.number="item.budget"
                prefix="₹"
              />
            </td>
            <td
             >
              <div
                class="color-category"
                :style="{
                  'background-color': item.color
                }"
              >
                &nbsp;
              </div>
            </td>
          </tr>
          </tbody>
        </v-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createBudget">Create</v-btn>

        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import {useAppStore} from "@/store/app";
import {mdiArrowDown, mdiArrowUp} from "@mdi/js";
import {computed, onMounted, reactive, ref, toRefs} from "vue";
import moment from "moment";
import {categoryColors, categoryList} from "@/constants/types";
import {transactionHeaders} from "@/constants/transactions";
// import { VDataTable } from 'vuetify'

export default {
  name: 'analyse-data',
  // components: {VDataTable},
  setup() {
    const appStore = useAppStore();
    const fileInput = ref(null);
    const state = reactive({
      mdiArrowUp, mdiArrowDown,
      filter: {
        month: moment().month() + 1,
      },
      monthList: [],
      file: null,
      transactions: [],
      uploadTransactionLoading: false,
      openBudgetDialoge: false,
      categoryList,
      itemsPerPage: 5,
      budget: [],
      headers: [
        { text: 'Category', value: 'category', title: "Category", align: 'end', key: 'category'},
        { text: 'Budget', value: 'credit', title: "Budget", align: 'end', key: 'budget'},
      ],
      headerData: [
        { title: 'Category', key: 'category'},
        { title: 'Debit', key: 'debit'},
        { title: 'Credit', key: 'credit'},
        { title: 'Net', key: 'net'},
        { title: 'Budget', key: 'budget'},
      ],
      transactionHeaderData: transactionHeaders,
      categories: categoryColors,
      categoryTransactions: [],
    });
    const formatDate = computed(() => {
      return (date) => {
        return moment(date).format("DD/MM/YY");
      };
    });
    const getBudgetVal = computed(() => {
      return (categoryVal) => {
        if(state.budget) {
          return state.budget?.budget?.find((item) => item.category === categoryVal) || 0
        }
        return {};
      }
    });
    const formattedTransactions = computed(() => {
      const keys = Object.keys(state.transactions);
      if(keys.length) {
        return keys.map((category) => {
          const budgetVal = state.budget?.budget?.find((item) => item.category === category)
          const budget = budgetVal?.budget || 0
          return {
            category,
            debit: state.transactions[category].debit,
            credit: state.transactions[category].credit,
            net: (state.transactions[category].debit - state.transactions[category].credit),
            budget,
          }
        });
      } return [];
    });

    const getCategoryTotalDebit = computed(() => {
      return (category) => formattedTransactions.value.find((item) => item.category === category).debit
    });
    const getCategoryTotalCredit = computed(() => {
      return (category) => formattedTransactions.value.find((item) => item.category === category).credit
    });
    const getTotalNet = computed(() => {
      return formattedTransactions.value.reduce((acc, item) => { acc += item.net; return acc; }, 0).toFixed(2);
    });

    function getColor (calories) {
      // if (calories > 100) return 'red'
      // else if (calories > 50) return 'orange'
      // else
      return 'green';
    }
    function getStartOfMonth(month) {
      return moment()
        .month(month)
        .startOf('month')
        .toISOString();
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
      state.transactions = await appStore.getAnalysedDataByCategory(filter);
      const budgetFilter = getStartOfMonth(state.filter.month)
      state.budget = await appStore.getBudget(budgetFilter);
    }
    function addBudget() {
      state.openBudgetDialoge = true;
    }
    async function createBudget() {
      const date = getStartOfMonth(state.filter.month);
      console.log(date)
      state.budget = await appStore.createBudget(state.categories, date);
    }

    async function getCategoryBasedItems(category) {
      populateMonthFilter();
      const filter = computeFilter();
      filter.category = category;
      state.categoryTransactions = await appStore.getCategoryTransactions(filter);
    }

    onMounted(async () => {
      populateMonthFilter();
      const filter = computeFilter();
      state.transactions = await appStore.getAnalysedDataByCategory(filter);
      const budgetFilter = getStartOfMonth(state.filter.month);
      state.budget = await appStore.getBudget(budgetFilter);
    });

    return {
      ...toRefs(state),
      fileInput,
      formatDate,
      getBudgetVal,
      formattedTransactions,
      getCategoryTotalDebit,
      getCategoryTotalCredit,
      getTotalNet,
      addBudget,
      createBudget,
      triggerFilterChange,
      getCategoryBasedItems,
      getColor,
    };
  },
};
</script>
<style lang="scss" scoped>
.color-category {
  border: 1px solid black;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  margin-top: -20px;
  margin-left: -20px;
}
.transaction-table {
  border: 0.5px solid gray;
  border-radius: 10px;
  padding: 5px;
}
.total-section {
  display: flex;
  margin: 5px 10px;
  right: 0;
}
.green-text {
  font-weight: bolder;
  color: green;
}
.red-text {
  font-weight: bolder;
  color: red;
}
.budget-text {
  font-weight: bold;
}
</style>
