const express = require("express");
const app = express();
const cors = require("cors");
const { hexToBytes, bytesToHex, utf8ToBytes } = require("ethereum-cryptography/utils")
const { sha256 } = require("ethereum-cryptography/sha256.js")
const { secp256k1 } = require("ethereum-cryptography/secp256k1")
const port = 3042;

app.use(cors());
app.use(express.json());

const transactions = [];

const balances = {};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/create-wallet', (req, res) => {
  const { privKey, pubKey } = req.body;
  const address = bytesToHex(sha256(hexToBytes(pubKey)).slice(-20))
  balances[address] = {
    privKey,
    pubKey,
    balance: 100
  };
  res.send({ status: 'ok' })
})

app.get("/transactions", (req, res) => {
  res.send(transactions);
});

app.get("/wallets", (req, res) => {
  res.send(
    Object.keys(balances).map(address => ({
      address, 
      ...balances[address]
    }))
  );
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  if(!balances[sender]) {
    return res.status(400).send({ message: "Invalid sender!" });
  }
  
  if(!balances[recipient]) {
    return res.status(400).send({ message: "Invalid recipient!" });
  }

  if (balances[sender].balance < amount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }

  const messageToSign = `${sender} sends ${amount} to ${recipient}`;

  if(!secp256k1.verify(
    signature,
    sha256(utf8ToBytes(messageToSign)),
    hexToBytes(balances[sender].pubKey)
  )) {
    return res.status(400).send({ message: "Invalid transaction!" });
  }


  balances[sender].balance -= parseInt(amount);
  balances[recipient].balance += parseInt(amount);
  transactions.unshift({ sender, recipient, amount, time: new Date })

  res.send({ balance: balances[sender].balance });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
