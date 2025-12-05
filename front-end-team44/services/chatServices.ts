const sendMessage = async (messages) => {
    const body = JSON.stringify({ model: "assistant:latest", messages: messages, stream: false })
    console.log("message", body)

    const response = await fetch(`http://100.91.114.102:9090/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,

    })
    return response
}

const ChatService = {
    sendMessage,
}

export default ChatService