import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import { 
   loadProvider, 
   loadNetwork, 
   loadAccounts,
   loadTokens,
   loadExchange,
   subscribeToEvents,
   loadAllOrders
   } from '../store/interaction';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import PriceChart from './PriceChart';
import MyTransaction from './MyTransaction';
import Trades from './Trades.js'
import OrderBook from './OrderBook';
import Alert from './Alert';

function App() {
    const dispatch = useDispatch()

    const loadBlockchainData = async ()=>{

    const provider = loadProvider(dispatch);

    const chainId = await loadNetwork(provider,dispatch);

    window.ethereum.on('chainChanged', ()=>{
      window.location.reload()
    })

    window.ethereum.on('accountsChanged',()=>{
      loadAccounts(provider,dispatch)  
    })

    const Dapp = config[chainId].Dapp
    const mETH = config[chainId].mETH
    await loadTokens([Dapp.address,mETH.address] ,provider,dispatch);

    const exchange = config[chainId].exchange
    const exc = await loadExchange(provider,exchange.address,dispatch);

    loadAllOrders(provider, exc , dispatch)

    subscribeToEvents(exc,dispatch)
  }

  useEffect(()=>{
    loadBlockchainData();
  })

  return (
    <div className='App'>

    <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          <MyTransaction />

          <Trades /> 

          <OrderBook />

        </section>
      </main>

       <Alert />
      
    </div>
  );
}

export default App;
