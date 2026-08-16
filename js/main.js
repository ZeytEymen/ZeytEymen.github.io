/* viliyimsi.com — statik sürüm
 *
 * Görsel yükleme artık JS'in işi değil: <img loading="lazy"> tarayıcının kendi
 * lazy loading'ini kullanıyor. Buradaki tek iş, öğeler görünür alana girdiğinde
 * yumuşak bir yükselme animasyonu vermek — içerik JS olmadan da tam görünür.
 */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "200px 0px" });

  items.forEach(function (el) { observer.observe(el); });
})();
