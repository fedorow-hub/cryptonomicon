<template>
  <div class="container">
    <section>
      <div class="flex">
        <div class="max-w-xs">
          <label for="wallet" class="block text-sm font-medium text-gray-700"
            >Тикер</label
          >
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              v-model="ticker"
              @keydown.enter="addTicker(ticker)"
              @input="inputTicker"
              type="text"
              name="wallet"
              id="wallet"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Например DOGE"
            />
          </div>
          <div
            v-if="offeredCoins.length"
            class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
          >
            <span
              v-for="o in offeredCoins"
              :key="o.id"
              @click="addTicker(o)"
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            >
              {{ o }}
            </span>
          </div>
          <div class="text-sm text-red-600">{{ notification }}</div>
        </div>
      </div>
      <button
        @click="addTicker(ticker)"
        type="button"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <!-- Heroicon name: solid/mail -->
        <svg
          class="-ml-0.5 mr-2 h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="#ffffff"
        >
          <path
            d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          ></path>
        </svg>
        Добавить
      </button>
    </section>
    <template v-if="tickers.length">
      <hr class="w-full border-t border-gray-600 my-4" />
      <div class="flex">
        <h3 class="mx-2">Фильтр:</h3>
        <input v-model="filter" />
      </div>
      <div>
        <button
          v-if="page > 1"
          @click="page = page - 1"
          class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Назад
        </button>
        <button
          v-if="hasNextPage"
          @click="page = page + 1"
          class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Вперед
        </button>
      </div>

      <hr class="w-full border-t border-gray-600 my-4" />
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="t in paginatedTickers"
          :key="t.id"
          @click="select(t)"
          :class="{
            'border-4': selectedTicker == t,
          }"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ t.name }} - USD
            </dt>
            <div class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatPrice(t.price) }}
            </div>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="handleDelete(t)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            >Удалить
          </button>
        </div>
      </dl>
      <hr class="w-full border-t border-gray-600 my-4" />
    </template>
    <section v-if="selectedTicker" class="relative">
      <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
        {{ selectedTicker.name }} - USD
      </h3>
      <div class="flex items-end border-gray-600 border-b border-l h-64">
        <div
          v-for="(bar, idx) in normalizedGraph"
          :key="idx"
          :style="{ height: `${bar}%` }"
          class="bg-purple-800 border w-10"
        ></div>
      </div>
      <button
        @click="selectedTicker = null"
        type="button"
        class="absolute top-0 right-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:svgjs="http://svgjs.com/svgjs"
          version="1.1"
          width="30"
          height="30"
          x="0"
          y="0"
          viewBox="0 0 511.76 511.76"
          style="enable-background: new 0 0 512 512"
          xml:space="preserve"
        >
          <g>
            <path
              d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
              fill="#718096"
              data-original="#000000"
            ></path>
          </g>
        </svg>
      </button>
    </section>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from "./api";

export default {
  name: "App",
  data() {
    return {
      ticker: "",
      tickers: [],
      selectedTicker: null,
      graph: [],
      coinList: [],
      offeredCoins: [],
      notification: "",
      filter: "",
      page: 1,
    };
  },
  watch: {
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathName}?filter=${value.filter}&page=${value.page}`
      );
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    selectedTicker() {
      this.graph = [];
    },
    tickers() {
      localStorage.setItem("criptonomicon", JSON.stringify(this.tickers));
    },
  },
  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    filteredTickers() {
      return this.tickers.filter((ticker) => ticker.name.includes(this.filter));
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },
  methods: {
    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((p) => (p.price = price));
    },
    formatPrice(price) {
      if (price === "-") return;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    add() {
      if (this.ticker !== "") {
        const currentTicker = {
          id: Date.now(),
          name: this.ticker,
          price: "-",
        };
        subscribeToTicker(currentTicker.name, (newPrice) =>
          this.updateTicker(currentTicker.name, newPrice)
        );
        this.tickers = [...this.tickers, currentTicker];
        this.ticker = "";
        this.filter = "";
      }
    },
    handleDelete(tickerToRemove) {
      let arr = this.tickers.filter((t) => t !== tickerToRemove);
      this.tickers = arr;
      localStorage.setItem("criptonomicon", JSON.stringify(this.tickers));
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove);
    },
    select(ticker) {
      this.selectedTicker = ticker;
    },
    addTicker(ticker) {
      this.ticker = ticker;
      let existTicker;
      for (let i = 0; i < this.tickers.length; i++) {
        if (this.tickers[i].name.toUpperCase() == ticker.toUpperCase()) {
          existTicker = ticker;
        }
      }
      if (existTicker) {
        this.notification = "Такой тикер уже добавлен";
        return;
      }
      this.add();
      this.notification = "";
      this.offeredCoins = [];
    },
    async fetchCoinList() {
      const f = await fetch(
        `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`
      );
      const data2 = await f.json();

      for (let data in data2.Data) {
        this.coinList.push(data);
      }
    },
    inputTicker() {
      this.notification = "";
      let tempAttay = this.coinList.filter(
        (c) => c.toLowerCase().indexOf(this.ticker.toLowerCase()) != -1
      );
      this.offeredCoins = tempAttay.splice(0, 4);
    },
  },
  mounted() {
    this.fetchCoinList();
    const tickersData = localStorage.getItem("criptonomicon");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }

    const { page, filter } = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (page) {
      this.page = page;
    }
    if (filter) {
      this.filter = filter;
    }
  },
};
</script>
