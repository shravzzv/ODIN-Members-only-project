/**
 * add a class .active to the current route url
 */

const navLinks = document.querySelectorAll('nav a')

navLinks.forEach((navLink) => {
  navLink.classList.remove('active')
  if (navLink.pathname === window.location.pathname)
    navLink.classList.add('active')
})
