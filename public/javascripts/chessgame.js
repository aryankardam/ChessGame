const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = "w"; // Set to 'w' or 'b' based on the player

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement); // ✅ Fixed: now inside the inner loop
        });
    });

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped")
    }
};

const handleMove = (source, target) => {
    console.log("Trying move from", source, "to", target);
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q',
    };
    console.log("Emitting move:", move);
    socket.emit("move", move);
};



const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",  // pawn
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
    };
    return unicodePieces[piece.type] || "";
};



socket.on("playerRole" , (role)=>{
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole" , (role)=>{
    playerRole = null;
    renderBoard();
})

socket.on("boardState" , (fen)=>{
    chess.load(fen);
    renderBoard();
})

socket.on("move" , (move)=>{
    chess.move(move);
    renderBoard();
})

// Initial render
renderBoard();
