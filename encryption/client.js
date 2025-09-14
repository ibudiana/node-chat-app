const io = require("socket.io-client");
const readline = require("readline");
const { generateKeyPair, encryptMessage, decryptMessage } = require("../helper");

const { publicKey, privateKey } = generateKeyPair();

const socket = io("http://localhost:3004");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let targetUsername = "";
let username = "";
const users = new Map();

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome, ${username} to the chat`);

    socket.emit("registerPublicKey", {
      username,
      publicKey,
    });

    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        if ((match = message.match(/^!secret (\w+)$/))) {
          targetUsername = match[1];
          console.log(`Now secretly chatting with ${targetUsername}`);
        } else if (message.match(/^!exit$/)) {
          console.log(`No more secretly chatting with ${targetUsername}`);
          targetUsername = "";
        } else {
          let finalMessage = message;

          if (targetUsername) {
            const targetPublicKey = users.get(targetUsername);
            if (targetPublicKey) {
              try {
                finalMessage = encryptMessage(message, targetPublicKey);
              } catch (err) {
                console.error("Failed to encrypt message:", err.message);
                return rl.prompt();
              }
            } else {
              console.log("Public key for target user not found.");
              return rl.prompt();
            }
          }

          socket.emit("message", {
            username,
            message: finalMessage,
            encrypted: !!targetUsername, // Mark encrypted messages
            to: targetUsername || null,   // Specify recipient if secret
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
  const { username: senderUsername, message: senderMessage, encrypted, to } = data;

  if (senderUsername !== username) {
    if (encrypted && to === username) {
      const decrypted = decryptMessage(senderMessage, privateKey);
      if (decrypted !== null) {
        console.log(`${senderUsername} (secret): ${decrypted}`);
      } else {
        console.log(`${senderUsername} (secret): [Failed to decrypt message]`);
      }
    } else if (encrypted && to !== username) {
      // Not the intended recipient – just see gibberish
      console.log(`${senderUsername} (secret): ${senderMessage}`);
    } else {
      // Public message
      console.log(`${senderUsername}: ${senderMessage}`);
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