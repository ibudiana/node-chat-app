const io = require("socket.io-client");
const readline = require("readline");
const { generateHash, verifyHash } = require("../helper");

const socket = io("http://localhost:3002");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let username = "";

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome, ${username} to the chat`);
    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        const hash = generateHash(message);
        socket.emit("message", { username, message, hash });
      }
      rl.prompt();
    });
  });
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, hash: senderHash } = data;
  if (senderUsername !== username) {
    const isValid = verifyHash(senderMessage, senderHash);

    if (!isValid) {
      console.log(`${senderUsername}: ${senderMessage} (Peringatan: Pesan ada yang merubah!)`);
    }else{
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