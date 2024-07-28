import { useState } from "react";
import server from "./server";

import { secp256k1 } from "ethereum-cryptography/secp256k1";

import { hashMessage, signMessage, getNonce } from "./custom.mjs";


function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const privateKey = prompt("Input your PRIVATE Key to sign the transfer:");

    if(!privateKey) {
      alert("PRIVATE key must be provided!");
      return;
    }
    
    const publicKey = secp256k1.getPublicKey(privateKey);
    const nonce = getNonce( ).toString( );
    const signature = await signMessage(String(sendAmount) + nonce, privateKey);

    if(!secp256k1.verify(signature, hashMessage(String(sendAmount) + nonce), publicKey)) {
      alert("Signature could not be verified!");
      return;
    }
    
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        nonce,
        signature,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
