A simple dashboard for viewing and managing an investment portfolio in Angular.js.


### Install NodeJS

Install a current version of NodeJS according to the [instructions](http://nodejs.org/download/).

### Install Dependencies

    npm install

### Build the Project and Watch for Changes

    gulp build
    (wait until it finishes!)

### Start Your Dev Server

    (in another tab):
    gulp start:dev

### Watch for Changes and Recompile SASS

    gulp watch

### Configure Your Stock Market and Start Dev Server

    npm run startMyMarket [stock] [investorName]

### Check It Out in a Browser

Check out the running application by opening it in your web browser: [http://localhost:3000/](http://localhost:3000/)

The application is split into 3 route views - market, investor, and manager.

*Market View*

- The Market view includes:
 - refresh() which hits the /stocks endpoint to refresh the stock data and chart.

*Investor View*

- The Investor includes:
 - loadInvestor() which calls the /active-investor endpoint to load the current investor's data
 - getQuote() which uses the /quote endpoint to return a quote for a specific stock. We then refresh the stocks in order to show provide the freshest stock data for if someone wants to buy a stock.
 - buyStock() which does quite a bit of validation before allowing the /buy endpoint to be hit. The validation is: check if stock exists, check if quantity is valid, check if investor has enough capital to buy, and check if market is open. If passes, we hit the /buy endpoint and send along data about the transaction, then on success we make it rain and then update /stocks and /active-investor data.

*Manager View*

- The Manager view includes:
 - open() which hits the /open endpoint, this opens the market if the market is not already open, and refreshes the webpage with "market is open" visuals
 - close() which does the opposite of ^
 - changeGrowthRate(), changeChangeInterval(), and changeVolatilityPercent() which update specific properties in the stock. Also refreshes these new values in the view.


