import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  let clients = [];
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("clientsLoad", () => {
      io.emit("clientsData", clients);
    });

    socket.on("creditDecrease", (data) => {
      if (clients[data.id - 1]) {
        if (clients[data.id - 1].credit < data.amount) {
          console.error(
            `Client ${data.id - 1} tried to decrease credit by ${
              data.amount
            } but has only ${clients[data.id - 1].credit} credits left`
          );
          return;
        }
        clients[data.id - 1].credit -= data.amount;
        clients[data.id - 1].gamesLeft += data.gameBought;
        socket.emit("creditUpdate", clients[data.id - 1]);
        io.emit("adminCreditUpdate", clients[data.id - 1]);
      } else {
        console.error(
          `Client ID ${data.id - 1} not found in creditDecrease event`
        );
      }
    });

    socket.on("gameBuy", (data) => {
      if (clients[data.id - 1]) {
        if (clients[data.id - 1].gamesLeft <= 0) {
          console.error(
            `Client ${
              data.id - 1
            } tried to buy a game but has no more games left`
          );
          return;
        }
        clients[data.id - 1].gamesLeft -= 1;
        socket.emit("creditUpdate", clients[data.id - 1]);
        io.emit("adminCreditUpdate", clients[data.id - 1]);
      } else {
        console.error(`Client ID ${data.id - 1} not found in gameBuy event`);
      }
    });

    socket.on("creditIncrease", (data) => {
      if (clients[data.id - 1]) {
        clients[data.id - 1].credit += data.amount;
        io.emit("creditUpdate", clients[data.id - 1]);
      } else {
        console.error(
          `Client ID ${data.id - 1} not found in creditIncrease event`
        );
      }
    });

    socket.on("adminCreditIncrease", (data) => {
      if (clients[data.id - 1]) {
        clients[data.id - 1].credit += data.amount;
        io.emit("fromAdminCreditUpdate", clients[data.id - 1]);
        socket.emit("creditUpdate", clients[data.id - 1]);
      } else {
        console.error(
          `Client ID ${data.id - 1} not found in adminCreditIncrease event`
        );
      }
    });

    socket.on("adminReset", () => {
      clients = [];
      io.emit("clientReset");
    });

    socket.on("adminBlock", (data) => {
      if (clients[data.id - 1]) {
        clients[data.id - 1].blocked = clients[data.id - 1].blocked
          ? false
          : true;
        io.emit("blockUpdate", clients[data.id - 1]);
      } else {
        console.error(`Client ID ${data.id - 1} not found in adminBlock event`);
      }
    });

    socket.on("clientAdd", () => {
      const id = clients.length;
      const client = { id: id + 1, credit: 100, gamesLeft: 0, blocked: false };
      clients.push(client);

      socket.emit("clientSet", client);
      io.emit("clientSetAdmin", client);
    });

    socket.on("clientRemove", (data) => {
      console.log("Client remove event received in server.mjs:", data);
      io.emit("clientRemove", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });

    socket.on("connect", () => {
      console.log("A user connected");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
