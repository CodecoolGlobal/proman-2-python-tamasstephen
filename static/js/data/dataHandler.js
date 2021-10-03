export let dataHandler = {
  getBoards: async function () {
    const response = await apiGet("/api/boards");
    return response;
  },
  getBoard: async function (boardId) {
    // the board is retrieved and then the callback function is called with the board
  },
  getStatuses: async function () {
    const response = await fetch("/api/get_statuses")
    return response;

    // the statuses are retrieved and then the callback function is called with the statuses
  },
  getStatus: async function (statusId) {
    // the status is retrieved and then the callback function is called with the status
  },
  getCardsByBoardId: async function (boardId) {
    const response = await apiGet(`/api/boards/${boardId}/cards/`);
    return response;
  },
  getCard: async function (cardId) {
    // the card is retrieved and then the callback function is called with the card
  },
  createNewBoard: async function (boardTitle) {
    // creates new board, saves it and calls the callback function with its data
    const response = await fetch("/api/create_board", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title: `${boardTitle}`})
    })
    return await response.json();
  },
  createNewCard: async function (cardTitle, boardId, statusId) {
    // creates new card, saves it and calls the callback function with its data
  },
  getStatusesByBoardId: async function(boardId){
    const response = await fetch(`/api/get_statuses/${boardId}`);
    return response
  },
  bindStatusToBoard: async function(statusId, boardId){
    const response = await fetch("/api/status_to_board", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({board_id: `${boardId}`, status_id: `${statusId}`})
    })
    return response
  },
  createNewStatus: async function(statusName){
    const response = await fetch("/api/create_status", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title: `${statusName}`}),
    });
    return response
  }
};

async function apiGet(url) {
  let response = await fetch(url, {
    method: "GET",
  });
  if (response.status === 200) {
    let data = response.json();
    return data;
  }
}

async function apiPost(url, payload) {}

async function apiDelete(url) {}

async function apiPut(url) {}
