import { useRef, useState } from "react";
import server from "./server";
import { encrypt } from "ethereum-cryptography/aes.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { getPassBytesAndIVFromPassword, padArray } from "./utils";

function Wallets({ wallets, useWallet, walletCreated }) {

  const [password, setPassword] = useState('')
  const passwordRef = useRef()

  async function createWallet(event) {
    event.preventDefault();

    if (password == '') {
      passwordRef.current.focus()
    } else {
      const privKey = secp256k1.utils.randomPrivateKey();
      const { passBytes, iv } = getPassBytesAndIVFromPassword(password);
      const pubKey = secp256k1.getPublicKey(privKey);
      const encryptedPrivateKey = await encrypt(privKey, passBytes, iv);
      await server.post('/create-wallet', { privKey: toHex(encryptedPrivateKey), pubKey: toHex(pubKey) })
      walletCreated()
      setPassword('')
    }
  }

  return (
    <div className="container w-1/2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
        <h1>Wallets</h1>
        <form style={{ display: 'flex'}} onSubmit={createWallet}>
          <input type="password" ref={passwordRef} value={password} onChange={event => setPassword(event.target.value)} style={{ padding: '.5rem .5rem'}} placeholder="Password" />
          <button>Create</button>
        </form>
      </div>

      <table className="w-full" cellSpacing={0}>
        <thead>
          <tr>
            <th style={{ width: '70%' }} className="border p-2">Wallet</th>
            <th className="border p-2">Balance</th>
            <th className="border p-2"></th>
          </tr>
        </thead>
        <tbody>
          {wallets.map(item => (
            <tr key={item.address}>
              <td className="p-2 border">{item.address}</td>
              <td className="p-2 border">{item.balance}</td>
              <td className="border">
                <button onClick={() => useWallet(Object.assign({}, item))} type="button" style={{padding: '.25rem 2rem', width: '100%', cursor: 'pointer'}}>Use</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Wallets;
