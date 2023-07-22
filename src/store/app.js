// Utilities
import { defineStore } from "pinia";
import { axiosInstance } from "../utils/axios";
const axiosCall = axiosInstance("/");
export const useAppStore = defineStore("app", {
  actions: {
    async getAllTransactions() {
      const transactions = await axiosCall(
        `/transaction?clientId=${this.clientId}`
      );
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
  },
  state: () => ({
    clientId: "64af5502ef83bb8e6eb1f0bd",
    transactions: [],
  }),
});
