function switch_to_dir(id, viewname, dir, _select, file_type) {
  function icon(name, isDirectory) {
    if (isDirectory) return `<i class="fas fa-folder"></i>`;

    if (name.endsWith(".csv")) return `<i class="fas fa-file-csv"></i>`;
    return `<i class="fas fa-file"></i>`;
  }

  function file_row({ name, size, ctime, isDirectory, link, selectBtn }) {
    return `<tr><td>${icon(name, isDirectory)}</td><td>${
      link ? `<a href="${link}">${name}</a>` : name
    }</td><td>${new Date(ctime).toLocaleString(
      window.detected_locale
    )}</td><td>${size}</td><td>${
      selectBtn
        ? `<button type="button" class="btn btn-secondary btn-sm btn-xs" onclick="${selectBtn}">Select</button>`
        : ""
    }</td></tr>`;
  }
  function draw_shared_files(e, filesUnsorted, breadcrumbs) {
    const sortGetter =
      sort_shared_files_by === "Name"
        ? (o) => o.name
        : sort_shared_files_by === "Date"
        ? (o) => new Date(o.ctime)
        : (o) => o.size;
    function compare(a, b) {
      const aval = sortGetter(a),
        bval = sortGetter(b);
      if (aval < bval) {
        return sort_shared_files_desc ? 1 : -1;
      }
      if (aval > bval) {
        return sort_shared_files_desc ? -1 : 1;
      }
      return 0;
    }
    const files = filesUnsorted.sort(compare);
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
      ? `<div><button type="button" class="btn btn-primary" onclick="select_shared_link(null, '${_select}');">Clear</button></div>`
      : ""
  }
  </div>
  <table class="table table-sm"><thead>
  <tr>
      <th scope="col"></th>
      ${["Name", "Date", "Size"]
        .map(
          (k) =>
            `<th scope="col"><a href="javascript:sort_shared_files('${k}', '${id}', '${viewname}', '${dir}', '${_select}', '${file_type}')">${
              sort_shared_files_by === k
                ? `<b>${k}</b>${
                    sort_shared_files_desc
                      ? `<i class="fas fa-caret-down"></i>`
                      : `<i class="fas fa-caret-up"></i>`
                  }`
                : k
            }</a></th>`
        )
        .join("")}      
      <th scope="col"></th>
    </tr>
    </thead><tbody>${files.map(file_row).join("")}</tbody></table>`);
  }

  view_post(
    viewname,
    "get_directory",
    { dir, id, _select, file_type },
    (res) => {
      draw_shared_files($("#" + id), res.files || [], res.breadcrumbs || []);
    }
  );
}

let sort_shared_files_by = "Name";
let sort_shared_files_desc;

function sort_shared_files(byWhat, id, viewname, dir, _select, file_type) {
  if (byWhat == sort_shared_files_by)
    sort_shared_files_desc = !sort_shared_files_desc;
  sort_shared_files_by = byWhat;
  switch_to_dir(id, viewname, dir, _select, file_type);
}
//https://gist.github.com/creationix/7435851

// A simple function to get the dirname of a path
// Trailing slashes are ignored. Leading slash is preserved.
function dirname(path) {
  function join(/* path segments */) {
    // Split the inputs into a list of path commands.
    var parts = [];
    for (var i = 0, l = arguments.length; i < l; i++) {
      parts = parts.concat(arguments[i].split("/"));
    }
    // Interpret the path commands to get the new resolved path.
    var newParts = [];
    for (i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];
      // Remove leading and trailing slashes
      // Also remove "." segments
      if (!part || part === ".") continue;
      // Interpret ".." to pop the last segment
      if (part === "..") newParts.pop();
      // Push new path segments.
      else newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "") newParts.unshift("");
    // Turn back into a single string path.
    return newParts.join("/") || (newParts.length ? "/" : ".");
  }
  return join(path, "..");
}

function sharedLinkSelect(nm, viewname, e, file_type, start_path) {
  const inModal = $(e).closest("#scmodal").length > 0;
  const curdir = $(e).val() ? dirname($(e).val()) : start_path;
  const url = `/view/${viewname}?_select=${nm}&dir=${encodeURIComponent(
    curdir
  )}&file_type=${encodeURIComponent(file_type || "Only files")}`;
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

function manual_edit_shared_link(id) {
  const $id = $("#" + id);
  const newval = window.prompt("Enter new path", $id.val());
  if (newval) $id.val(newval);
}
