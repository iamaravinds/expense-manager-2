// Utilities
import { defineStore } from "pinia";
import { axiosInstance } from "../utils/axios";
const axiosCall = axiosInstance("/");
export const useAppStore = defineStore("app", {
  actions: {
    async getAllTransactions(filter = {}) {
      let url = `/transaction?clientId=${this.clientId}`;
      if (filter.from) {
        url+=`&from=${filter.from}`
      }
      if (filter.to) {
        url+=`&to=${filter.to}`
      }
      const transactions = await axiosCall(url);
      this.transactions = transactions.data;
      return transactions.data;
    },
    async getAnalysedDataByCategory(filter = {}) {
      let url = `/analyse?clientId=${this.clientId}`;
      if (filter.from) {
        url+=`&startDate=${filter.from}`
      }
      if (filter.to) {
        url+=`&endDate=${filter.to}`
      }
      const transactions = await axiosCall(url);
      this.transactions = transactions.data;
      return transactions.data;
    },

    async uploadTransactions(transactionsData) {
      const transactions = await axiosCall.post(`/transaction`, {
        data: {
          clientId: this.clientId,
          transactions: transactionsData,
        },
      });
      return transactions.data;
    },
    async updateCategory(transactionId, category) {
      const transactions = await axiosCall.put(`/transaction/${transactionId}/category`, {
        data: {
          clientId: this.clientId,
          category,
        },
      });
      return transactions.data;
    },
    async createBudget(budget, date) {
      const budgetResponse = await axiosCall.post(`/budget/create`, {
        clientId: this.clientId,
        budget,
        date,
      });
      return budgetResponse.data;
    },

    async getBudget(date) {
      let url = `/budget?clientId=${this.clientId}`;
      if (date) {
        url+=`&date=${date}`
      }
      const budgetResponse = await axiosCall.get(url);
      return budgetResponse.data;
    },
  },
  state: () => ({
    clientId: "64af5502ef83bb8e6eb1f0bd",
    transactions: [],
  }),
});
