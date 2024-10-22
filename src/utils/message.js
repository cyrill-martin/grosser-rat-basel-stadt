export async function noData(messageInstance, message) {
  messageInstance.error(message, {
    duration: 6000
  })
}
