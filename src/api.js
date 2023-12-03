/* eslint-disable */

const tickerHandlers = new Map();

const loadtickerHandlers = () => {
  if(tickerHandlers.size === 0) {
    return;
  }
  const paramsObj = { 
    fsyms: [...tickerHandlers.keys()].join(','), 
    tsyms: "USD", 
    api_key: "77e6394ba12687cddc32263c05f1171c77d71d241ec1fb6e512126c14aadad83" 
  };
  const searchParams = new URLSearchParams(paramsObj);
  
  fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?${searchParams.toString()}`
    )
    .then(r => r.json())
    .then(rowData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rowData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickerHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn( newPrice));
      })
    }
  );
}

//Object.entries для объекта {a: 1, b: 2} возвращает массив, содержащий массивы [['a', 1], ['b', 2]], тоесть он преобразует Object в коллекцию Map
//далее метод Object.fromEntries из коллекции Map [['a', 1], ['b', 1]] преобразует обратно в объект со свойствами и их значениями

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickerHandlers.get(ticker) || [];
  tickerHandlers.set(ticker, [...subscribers, cb]);
}

export const unsubscribeFromTicker = (ticker) => {
  tickerHandlers.delete(ticker.name);
}

setInterval(loadtickerHandlers, 5000);
