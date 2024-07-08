const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
let directory = args[1];

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  let data_rec = "";
  socket.on("data", (data) => {
    data_rec += data.toString();

    const [requestHeaders, content] = data_rec.split("\r\n\r\n");
    const [lines, ...headers] = requestHeaders.split("\r\n");
    const [HTTPmethod, target, version] = lines.split(" ");

    if (HTTPmethod == "POST") {
      const filename = target.split("/").pop();
      const filepath = path.join(directory, filename);
      fs.writeFile(filepath, content, (err) => {
        if (err) {
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        } else {
          socket.write("HTTP/1.1 201 Created\r\n\r\n");
        }
      });
    } else {
      if (target == "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
      } else if (target.includes("/echo/")) {
        const str = target.split("/echo/")[1];
        const leng = str.length;
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${leng}\r\n\r\n${str}`
        );
      } else if (target.includes("/user-agent")) {
        const userAgentHeader = headers.find((header) =>
          header.startsWith("User-Agent:")
        );
        const agent = userAgentHeader ? userAgentHeader.split(": ")[1] : "";
        const leng = agent.length;
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${leng}\r\n\r\n${agent}`
        );
      } else if (target.startsWith("/files")) {
        const rel = path.join(directory, target.substring(7));
        if (fs.existsSync(rel)) {
          fs.readFile(rel, "utf8", (err, filedata) => {
            if (err) {
              socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            } else {
              socket.write(
                `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${filedata.length}\r\n\r\n${filedata}`
              );
            }
          });
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
