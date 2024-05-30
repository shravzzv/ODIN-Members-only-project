/**
 * Contains the logic required for the messageDeleteDialog mixin to work in the dashboard templates.
 */

const dialog = document.querySelector('#messageDeleteDialog')
const messageIdInput = document.querySelector('#messageId')
const redirectUriInput = document.querySelector('#redirectUri')
const form = document.querySelector('#dialogForm')
let scrollTop = 0

const showDialog = (e) => {
  const messageId = e.target.getAttribute('data-id')
  form.action = `/dashboard/message/${messageId}/delete`

  messageIdInput.value = messageId
  redirectUriInput.value = window.location.href

  scrollTop = window.scrollY
  document.body.style.top = `-${scrollTop}px`

  dialog.showModal()
}

const closeDialog = () => {
  form.removeAttribute('action')
  messageIdInput.removeAttribute('value')
  dialog.close()
  window.scrollTo({
    top: scrollTop,
    left: 0,
    behavior: 'auto',
  })
}

document
  .querySelectorAll('.delete')
  .forEach((btn) => btn.addEventListener('click', showDialog))

document.querySelector('#closeDialog').addEventListener('click', closeDialog)
