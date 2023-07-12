<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-sheet color="pink-lighten-2" class="pa-4">
        <v-avatar class="mb-4" color="yellow-lighten-2" size="80">SA</v-avatar>

        <div>Welcome Aravind S</div>
      </v-sheet>

      <v-divider />

      <v-list class="bg-red-lighten-5">
        <v-list-item v-for="[icon, text] in links" :key="icon" link>
          <v-list-item-icon>
            <v-icon :icon="mdiAccount"></v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="py-8 px-6" fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mdiAccount } from "@mdi/js";
export default {
  data: () => ({
    drawer: null,
    mdiAccount,
    links: [["mdi-inbox-arrow-down", "Home"]],
  }),
};
</script>
