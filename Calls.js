// Inside io.on("connection")
socket.on("callUser", ({ userToCall, signalData, from }) => {
    io.to(userToCall).emit("callIncoming", { signal: signalData, from });
});

socket.on("answerCall", ({ to, signal }) => {
    io.to(to).emit("callAccepted", signal);
});
