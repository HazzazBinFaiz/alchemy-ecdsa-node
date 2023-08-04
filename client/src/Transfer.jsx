import { createRef, useEffect, useState } from "react";
import server from "./server";
import { decrypt } from "ethereum-cryptography/aes";
import { bytesToHex, hexToBytes, utf8ToBytes } from "ethereum-cryptography/utils";
import { sha256 } from "ethereum-cryptography/sha256";
import { padArray } from "./utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";

function Transfer({ wallet, setWallet, syncData }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [password, setPassword] = useState("");
  const amountRef = createRef()

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      let passBytes = utf8ToBytes(password);
      passBytes = padArray(passBytes, Math.ceil(passBytes.length / 16) * 16, 0);
      const iv = passBytes.slice(-16);
      const privateKey = await decrypt(hexToBytes(wallet.privKey), passBytes, iv);
      const pubKey = secp256k1.getPublicKey(privateKey)
      const address = bytesToHex(sha256(pubKey).slice(-20))
      if (address != wallet.address) {
        alert('Invalid password')
        return;
      }
      const messageToSign = `${address} sends ${sendAmount} to ${recipient}`;

      const signature = secp256k1.sign(sha256(utf8ToBytes(messageToSign)), privateKey);

      const { data } = await server.post('/send', {
        sender: address,
        recipient,
        amount: sendAmount,
        signature: signature.toCompactHex()
      })
      setWallet(Object.assign(wallet, { balance: data.balance }))
      syncData()
    } catch (e) {
      const message = e.response?.data?.message;
      alert(message)
    }
  }

  useEffect(() => {
    setSendAmount(0)
    setRecipient('')
    setPassword('')
    amountRef.current.focus()
  }, [wallet])

  return (
    <form className="container transfer" onSubmit={transfer} style={{ width: '100%'}}>
      <h1>Send Transaction</h1>

      <label>
        Sender
        <div style={{ display: 'flex' }}>
        <input
          value={wallet.address}
          readOnly
          style={{ backgroundColor: '#eee', flexGrow: 'grow', width: '100%' }}
        ></input>
        <div style={{ backgroundColor: '#eee', padding: '.5rem 1rem', display: 'flex', alignItems: 'center', border: '1px solid gray', textAlign: 'center'}}>Balance: {wallet.balance}</div>
        </div>
      </label>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          type="number"
          min={1}
          max={wallet.balance}
          ref={amountRef}
          onChange={setValue(setSendAmount)}
          required
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address"
          value={recipient}
          onChange={setValue(setRecipient)}
          required
        ></input>
      </label>

      <label>
        Password
        <input
          placeholder="Password of your wallet"
          type="password"
          value={password}
          onChange={setValue(setPassword)}
          required
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
