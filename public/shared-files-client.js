function file_row({ name, size, ctime, isDirectory }) {
  return `<tr><td>${name}</td><td>${ctime}</td><td>${size}</td></tr>`;
}
function draw_shared_files(e, dir) {
  e.html(`<table><thead>
  <tr>
      <th scope="col">Name</th>
      <th scope="col">Date</th>
      <th scope="col">Size</th>
    </tr>
    </thead><tbody>${dir.map(file_row).join("")}</tbody></table>`);
}

function switch_to_dir(id, viewname, dir) {
  view_post(viewname, "get_directory", { dir }, (res) => {
    draw_shared_files($("#" + id), res.success || []);
  });
}
