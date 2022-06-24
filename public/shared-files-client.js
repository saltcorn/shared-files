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
    e.html(`<div class="d-flex justify-content-between">
    <nav aria-label="breadcrumb">
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
  ${
    _select
      ? `<a href="javascript:select_shared_link(null, '${_select}');">Select none</a>`
      : ""
  }
  </div>
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

function sharedLinkSelect(nm, viewname, e) {
  const inModal = $(e).closest("#scmodal").length > 0;
  const url = `/view/${viewname}?_select=${nm}`;
  if (inModal) {
    if ($(`#selectfile${nm}`).length === 0)
      $(e).after(`<div id="selectfile${nm}"></div>`);
    $.ajax(url, {
      success: function (res, textStatus, request) {
        $(`#selectfile${nm}`).html(res);
      },
    });
  } else ajax_modal(url);
}
function select_shared_link(val, nm) {
  $(`#input${nm}`).val(val);
  const inModal = $(`#input${nm}`).closest("#scmodal").length > 0;
  if (!inModal) {
    var myModalEl = document.getElementById("scmodal");
    var modal = bootstrap.Modal.getInstance(myModalEl);
    modal.hide();
  } else $(`#selectfile${nm}`).remove();
}
