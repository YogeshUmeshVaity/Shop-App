/**
 * This script will be executed from inside the <script> tag of end.ejs file.
 */

const backdrop = document.querySelector('.backdrop')
const sideDrawer = document.querySelector('.mobile-nav')
const menuToggle = document.querySelector('#side-menu-toggle')

/**
 * Backdrop means the screen behind the side-drawer. When the user clicks on the backdrop, the
 * drawer should disappear.
 */
function backdropClickHandler() {
    backdrop.style.display = 'none'
    sideDrawer.classList.remove('open')
}

function menuToggleClickHandler() {
    backdrop.style.display = 'block'
    sideDrawer.classList.add('open')
}

backdrop.addEventListener('click', backdropClickHandler)
menuToggle.addEventListener('click', menuToggleClickHandler)
