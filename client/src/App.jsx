import Wallets from "./Wallets";
import Transfer from "./Transfer";
import "./App.scss";
import { useState, useEffect } from "react";
import server from "./server";
import Transactions from "./Transactions";

function App() {
  const [wallet, setWallet] = useState({ address: '', balance: 0});

  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  function fetchWallets() {
    server.get('/wallets').then(response => {
      setWallets(response.data)
    }).catch(e => {
      console.log(e)
      setWallets([])
    })
  }
  

  function fetchTransactions() {
    server.get('/transactions').then(response => {
      setTransactions(response.data)
    }).catch(e => {
      setTransactions([])
    })
  }

  function syncData() {
    fetchWallets();
    fetchTransactions();
  }

  useEffect(syncData, [])
  
  return (
    <div className="app">
      <Transfer wallet={wallet} setWallet={setWallet} syncData={syncData}/>
      <Wallets wallets={wallets} useWallet={setWallet} walletCreated={fetchWallets}/>
      <Transactions transactions={transactions}/>
    </div>
  );
}

export default App;
