const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	port: 465,
	host: "smtp.gmail.com",
	auth: { user: "jinniekhuraana@gmail.com", pass: "ksgijfbvmcfdrptk" },
	secure: true,
});

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
	debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
	res.render("index", { roomId: req.params.room });
});
app.post("/send-mail", (req, res) => {
	console.log(req.data)
	const to = req.body.to;
	const url = req.body.url;

	const maildata = {
		from: "agrim310108@gmail.com",
		to: to,
		subject: "Someone is inviting you to a meeting",
		html: `<p>Hey There! </p>
        <p>Join this meeting on this link ${url}</p>
        `,
	};

	transporter.sendMail(maildata, (error, info) => {
		if (error) return console.log(error);
        res.status(200).send({ msg: "Invitation Sent!", msgid: info.msgid })
    });
});
io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		io.to(roomId).emit("userConnected", userId);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});
	});
});

server.listen(process.env.PORT || 3030);
