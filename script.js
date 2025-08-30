function loadTemplate(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(err => console.error("Error loading template:", err));
}
loadTemplate("home", "home.html")