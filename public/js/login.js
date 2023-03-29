const form = document.getElementById('login-form')

form.addEventListener('submit', (event) => {
    event.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem("rtmToken", data.rtmToken)
                sessionStorage.setItem('rtmUID', data.uid)
                window.location = 'index.html'
            } else {
                alert('Invalid username or password.')
            }
        })
        .catch(error => {
            console.error('Error:', error)
        })
})
