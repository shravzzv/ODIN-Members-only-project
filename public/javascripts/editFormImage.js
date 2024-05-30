/**
 * Allows a layover button to function as the label for editing images in signup form, message edit form and the profile update form.
 */

document
  .querySelector('#editPicBtn')
  .addEventListener('click', () => document.getElementById('file').click())
