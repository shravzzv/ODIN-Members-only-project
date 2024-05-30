/**
 * Contains the logic for the password visibility toggle to function for all the password inputs.
 */

const eyeClosedIcons = document.querySelectorAll('.eyeClosed')
const eyeOpenIcons = document.querySelectorAll('.eyeOpen')

eyeClosedIcons.forEach((icon) => (icon.style.display = 'none'))

eyeOpenIcons.forEach((icon) =>
  icon.addEventListener('click', (e) => {
    //- make the corresponding password input as text input
    const id = e.target.getAttribute('data-id')
    const passwordInput = document.getElementById(id)
    passwordInput.type = 'text'

    //- hide the clicked icon
    icon.style.display = 'none'

    //- show the eye open icon
    document.querySelector(`.eyeClosed[data-id=${id}]`).style.display = 'inline'
  })
)

eyeClosedIcons.forEach((icon) =>
  icon.addEventListener('click', (e) => {
    //- make the corresponding password input as text input
    const id = e.target.getAttribute('data-id')
    const passwordInput = document.getElementById(id)
    passwordInput.type = 'password'

    //- hide the clicked icon
    icon.style.display = 'none'

    //- show the eye open icon
    document.querySelector(`.eyeOpen[data-id=${id}]`).style.display = 'inline'
  })
)
