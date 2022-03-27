function switch_to_dir(id, viewname, dir, _select) {
  function icon(name, isDirectory) {
    if (isDirectory) return `<i class="fas fa-folder"></i>`;

    if (name.endsWith(".csv")) return `<i class="fas fa-file-csv"></i>`;
    return `<i class="fas fa-file"></i>`;
  }

  function file_row({ name, size, ctime, isDirectory, link }) {
    return `<tr><td>${icon(name, isDirectory)}</td><td>${
      link ? `<a href="${link}">${name}</a>` : name
    }</td><td>${ctime}</td><td>${size}</td></tr>`;
  }
  function draw_shared_files(e, files, breadcrumbs) {
    e.html(`<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      ${breadcrumbs
        .map((b) =>
          b.link
            ? `<li class="breadcrumb-item"><a href="${b.link}">${b.name}</a></li>`
            : `<li class="breadcrumb-item active" aria-current="page">${b.name}</li>`
        )
        .join("")}      
    </ol>
  </nav>
  <table class="table table-sm"><thead>
  <tr>
      <th scope="col"></th>
      <th scope="col">Name</th>
      <th scope="col">Date</th>
      <th scope="col">Size</th>
    </tr>
    </thead><tbody>${files.map(file_row).join("")}</tbody></table>`);
  }

  view_post(viewname, "get_directory", { dir, id, _select }, (res) => {
    draw_shared_files($("#" + id), res.files || [], res.breadcrumbs || []);
  });
}

function sharedLinkSelect(nm, viewname) {
  ajax_modal(`/view/${viewname}?_select=${nm}`);
}
function select_shared_link(val, nm) {
  $(`#input${nm}`).val(val);
  var myModalEl = document.getElementById("scmodal");
  var modal = bootstrap.Modal.getInstance(myModalEl);
  modal.hide();
}
