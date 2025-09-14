const io = require("socket.io-client");
const readline = require("readline");
const { generateKeyPair, signMessage, verifySignature } = require("../helper");
const { publicKey, privateKey } = generateKeyPair();

const socket = io("http://localhost:3003");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let registeredUsername = "";
let username = "";
const users = new Map();

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    registeredUsername = input;
    console.log(`Welcome, ${username} to the chat`);

    socket.emit("registerPublicKey", {
      username,
      publicKey
    });

    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        if ((match = message.match(/^!impersonate (\w+)$/))) {
          username = match[1];
          console.log(`Now impersonating as ${username}`);
        } else if (message.match(/^!exit$/)) {
          username = registeredUsername;
          console.log(`Now you are ${username}`);
        } else {
          const signature = signMessage(message, privateKey);
          socket.emit("message", {
            username,
            message,
            signature,
          });
        }
      }
      rl.prompt();
    });
  });
});

socket.on("init", (keys) => {
  keys.forEach(([user, key]) => users.set(user, key));
  console.log(`\nThere are currently ${users.size} users in the chat`);
  rl.prompt();
});

socket.on("newUser", (data) => {
  const { username, publicKey } = data;
  users.set(username, publicKey);
  console.log(`${username} join the chat`);
  rl.prompt();
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, signature: senderSignature } = data;

  // Ambil public key dari sender
  const senderPublicKey = users.get(senderUsername);
  let verified = false;

  if (senderPublicKey) {
    verified = verifySignature(senderMessage, senderSignature, senderPublicKey);
  }

  if (senderUsername !== username) {
    if (verified) {
      console.log(`${senderUsername}: ${senderMessage}`);
    } else {
      console.log(`${senderUsername}: ${senderMessage} ( this user is fake)`);
    }
    rl.prompt();
  }

});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting...");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting...");
  socket.disconnect();
  rl.close();
  process.exit(0);
});