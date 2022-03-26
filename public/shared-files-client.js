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
function draw_shared_files(e, dir) {
  e.html(`<table><thead>
  <tr>
      <th scope="col"></th>
      <th scope="col">Name</th>
      <th scope="col">Date</th>
      <th scope="col">Size</th>
    </tr>
    </thead><tbody>${dir.map(file_row).join("")}</tbody></table>`);
}

function switch_to_dir(id, viewname, dir) {
  view_post(viewname, "get_directory", { dir, id }, (res) => {
    draw_shared_files($("#" + id), res.success || []);
  });
}
