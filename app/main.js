const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage

const server = net.createServer((socket) => {
  let data_received;
  socket.on("data", (data) => {
    data_received += data.toString();

    const [HTTPmethod, target, version] = data_received.split(" ");
    const [host, user, accept] = data_received.split("\r\n");

    if (target == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (target.includes("/echo/")) {
      const str = target.split("/echo/")[1];
      const leng = str.length;
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${leng}\r\n\r\n${str}`
      );
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
