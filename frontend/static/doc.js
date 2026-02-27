document.addEventListener('DOMContentLoaded', function() {
  var burger = document.getElementById('nav-burger-btn');
  var sidebar = document.querySelector('.doc-sidebar');
  if (!burger || !sidebar) return;
  burger.setAttribute('type', 'button');
  burger.setAttribute('aria-expanded', 'false');
  sidebar.classList.remove('open');
  burger.classList.remove('open');
  var touchHandled = false;
  function toggleMenu() {
    sidebar.classList.toggle('open');
    burger.classList.toggle('open', sidebar.classList.contains('open'));
    burger.setAttribute('aria-expanded', sidebar.classList.contains('open'));
  }
  function closeMenu() {
    sidebar.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('touchend', function(e) {
    touchHandled = true;
    e.preventDefault();
    toggleMenu();
  }, { passive: false });
  burger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (touchHandled) { touchHandled = false; return; }
    toggleMenu();
  });
  sidebar.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() { closeMenu(); });
  });
  document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
});
