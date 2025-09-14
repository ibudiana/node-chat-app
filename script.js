const inquirer = require("inquirer");
const { spawn } = require("child_process");

let name = "";

async function mainMenu() {
  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: `Action sebagai ${name} silahkan pilih mode operasi:`,
      choices: [
        { name: "1) Hash", value: "hash" },
        { name: "2) Signature", value: "signature" },
        { name: "3) Encryption", value: "encryption" },
      ],
    },
  ]);

  switch (mode) {
    case "hash":
        const hash = spawn("node", [`hash/${name}.js`], {
            stdio: "inherit"
        });

        hash.on("close", (code) => {
            console.log(`Kembali ke menu utama (kode keluar: ${code})`);
            mainMenu(); 
        });
        console.log("Mode Hash dipilih");
        break;
    case "signature":
        const signature = spawn("node", [`signature/${name}.js`], {
            stdio: "inherit"
        });

        signature.on("close", (code) => {
            console.log(`Kembali ke menu utama (kode keluar: ${code})`);
            mainMenu(); 
        });
        console.log("Mode Signature dipilih");
        break;
    case "encryption":
        const encryption = spawn("node", [`encryption/${name}.js`], {
            stdio: "inherit"
        });

        encryption.on("close", (code) => {
            console.log(`Kembali ke menu utama (kode keluar: ${code})`);
            mainMenu(); 
        });
        console.log("Mode Enkripsi dipilih");
        break;
    case "exit":
        console.log("Keluar dari program.");
        process.exit(0);
  }

}

async function selectRole() {
  const { role } = await inquirer.prompt([
    {
      type: "list",
      name: "role",
      message: "Jalankan sebagai apa?",
      choices: [
        { name: "Server", value: "server" },
        { name: "Client", value: "client" },
      ],
    },
  ]);

  if (role === "server") {
    name = "server";
  } else {
    name = "client";
  }

  await mainMenu();
}

// Mulai program
selectRole();