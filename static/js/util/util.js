const util = {
    wait(ms){
        return new Promise((resolve) => { return setTimeout(resolve, ms) });
},

    getBoardIdFromBoard(board){
    return board.dataset.boardId
},
}

export default util
