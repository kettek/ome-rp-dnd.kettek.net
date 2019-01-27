const path = require('path');
let target_element   = null;
let filepath_element = null;
let filepath = '';

ome.on('filepath', (path) => {
  filepath = path;
  let title = filepath.substring(filepath.lastIndexOf('/')+1);
  title = title.substring(0, title.lastIndexOf('.'));
  title = title.replace(/(-|^)([^-]?)/g, (_, prep, letter) => (prep && ' ') + letter.toUpperCase())
  filepath_element.innerHTML = "<a href='/'>Pochy's D&D Reference</a> &nbsp;→&nbsp; <a>&#8230;</a> &nbsp;→&nbsp; <a>" + title + "</a>";
});
ome.on('ready', () => {
  target_element = document.getElementById('page');
  filepath_element = document.getElementById('location');
});
ome.on('render', html => {
  target_element.innerHTML = html;
  // Iterate through all elements with src and href, changing their src/href to point to the absolute directory relative to the file's path.
  // NOTE: This seems very inefficient and silly. It would be nicer to implement a higher-level request proxy system, if possible.
  let src_list = target_element.querySelectorAll('[src],[href]');
  var r = new RegExp('^(?:[a-z]+:)?//', 'i');
  for (let i = 0; i < src_list.length; ++i) {
    let item = src_list[i];
    if (item.hasAttribute('href')) {
      let href = item.getAttribute('href');
      if (r.test(href) == false) {
        item.setAttribute('href', path.join(path.dirname(filepath),  href));
      }
    }
    if (item.hasAttribute('src')) {
      let src = item.getAttribute('src');
      if (r.test(src) == false) {
        item.setAttribute('src', path.join(path.dirname(filepath), src));
      }
    }
  }
});
ome.on('line', line => {
  let el = document.querySelector('[data-source-line="'+line+'"]');
  if (el) el.scrollIntoView();
});
