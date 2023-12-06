// const socket = io()

const d = document

const messagesEl = d.querySelector('#messages')
const inputElement = d.querySelector('.inputBox input')

messagesEl.innerHTML = ""

const appendMessageElement = (user, time, msg) => {
    const div = d.createElement('div')
    div.classList.add('uk-width-1-1')
    div.innerHTML = `<span class="uk-label">${user} [${time}]</span> <span class="uk-margin-left">${msg}</span>`

    messagesEl.appendChild(div)

    // Encierro en un setTimeOut para que se actualice el scroll
    
    setTimeout(() => {
        messagesEl.scrollTo(0, messagesEl.scrollHeight)
    }, 250)
}

const appendUserActionElement = (user, joined) => {
    const div = d.createElement('div')
    div.classList.add('uk-width-1-1')
    div.classList.add('uk-flex')
    div.classList.add('joined')

    const type = joined ? 'success' : 'danger'
    const action = joined ? 'unio' : 'salio'

    div.innerHTML = `<span class="uk-label uk-label-${type}">${user} se ${action}</span>`

    messagesEl.appendChild(div)

    // Encierro en un setTimeOut para que se actualice el scroll
    
    setTimeout(() => {
        messagesEl.scrollTo(0, messagesEl.scrollHeight)
    }, 250)
}

// LOGICA!

let userName = null
let currentMessages = []

socket.on('chat-messages', (messagesList) => {
    currentMessages = messagesList
})

Swal.fire({
    title: 'Ingresa tu nombre',
    input: 'text',
    inputAttributes: {
        autocapitaliza: 'off'
    },
    confirmButtonText: 'Enviar',
    preConfirm: (userName) => {
        // agramos la logica del usuario

        if(!userName){
            Swal.showValidationMessage(
                `El usuario no puede estar en blanco`
            )
            return
        }

        return userName
    },
    allowOutsideClick: false
}).then(({ value }) => {

    userName = value
    socket.emit('user', { user: userName, action: true})

    // Renderizamos los mensajes actuales del server

    for( const { user, datetime, text} of currentMessages) {
        appendMessageElement(user, datetime, text)
    }

    socket.on('chat-message', ({ user, datetime, text}) => {
        // renderizamos el mensaje

        appendMessageElement(user, datetime, text)
    })

    socket.on('user', ({ user, action}) => {
        appendUserActionElement(user, action)
    })

    inputElement.addEventListener('keyup', ({ key, target }) => {
        if(key !== 'Enter') {
            return
        }

        const { value } = target

        if(!value){
            return
        }

        // Enviamos el mensaje al socket

        const fecha = new Date()

        const msg = { user: userName, datetime: fecha.toLocaleTimeString('en-US'), text: value }

        socket.emit('chat-message', msg)

        target.value = ""
        appendMessageElement(userName, fecha.toLocaleTimeString('en-US'), value)
    })
})