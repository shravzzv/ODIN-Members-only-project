const navLinks = document.querySelectorAll('nav a')

// add a class .active to the current route url
navLinks.forEach((navLink) => {
  navLink.classList.remove('active')
  if (navLink.pathname === window.location.pathname)
    navLink.classList.add('active')
})
