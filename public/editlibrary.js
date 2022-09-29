fillBookshelf()
    .then(initButtons)
    .then(initDeleteButtons);

// Initializes delete buttons for editlibrary.html
function initDeleteButtons () {
    const deleteButtons = document.querySelectorAll('.btn-delete');
  
    deleteButtons.forEach(button => {
      button.addEventListener('click', requestDeletion)
    })
  }
  
// Sends delete request to server
async function requestDeletion (event) {
    // Gets id from clicked "delete" button above the book
    const deleteBookId = {id: event.target.id};

    // Sends post request to server with book id as request body
    const response = await fetch('http://localhost:3000/deletebook', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(deleteBookId),
    });

    // Wird die response überhaupt gebraucht?
    const data = await response.json();
    if (data.status === 'deletion successful') {
        document.querySelector('#editor-bookshelf').innerHTML = 
        '<h2 style="color:grey">Buch gelöscht!</h2>'
    }
}