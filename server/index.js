const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");


app.use(cors());
app.use(express.json());

const publicKeys = {
  "a272f3fb2b862f427f7cddad5f9d77a8f7d4abdb": "035742e4e8b089c5f4545670ba5195bf3804c96ff5a74bf30a2f93005be328d1e0",
  "f0707f020229d698b13e788f6735caa324e77dd7": "0298fc3ca6b0d241f26b54ebc5593f75310d7660246e68e772b19653d7fefe8174",
  "34942c6b807c8fcf2caa5243e0c093478c9b007f": "036d6702b81ae8677e246f104cbaeb153bad3b71e22ba459e16a194147789a0154",
};

const balances = {
  "a272f3fb2b862f427f7cddad5f9d77a8f7d4abdb": 100,
  "f0707f020229d698b13e788f6735caa324e77dd7": 50,
  "34942c6b807c8fcf2caa5243e0c093478c9b007f": 75,
};

const txnHash = { }; //stores hashes of txns to prevent double spending


function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, nonce, signature } = req.body;

  //check if same request is duplicate: double spending
  const txn = hashMessage(JSON.stringify(signature));
  if(txnHash[txn]) {
    res.send({ balance: balances[sender] })
    console.log("Request duplicated!");
    return;
  } else { txnHash[txn] = Date.now( ); }
  
  //signature object work around!
  const signatureObj = JSON.parse(JSON.stringify(signature), (_, value) => (typeof value === "string" ? BigInt(value) : value));

  if(!secp256k1.verify(signatureObj, hashMessage(String(amount) + nonce), publicKeys[sender])) {
    res.send({ balance: balances[sender] });
    console.log("Signature verification failed!");
    return;
  } else {
    console.log("Signature successfully verified!");
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
