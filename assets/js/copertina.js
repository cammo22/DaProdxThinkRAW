// La copertina del libro sta in un <template>: la si clona sul tavolo e dentro il libro che si apre.
export function clonaCopertina() {
  return document.getElementById('tpl-copertina').content.firstElementChild.cloneNode(true);
}
