const Field = require("@saltcorn/data/models/field");
const Table = require("@saltcorn/data/models/table");
const Form = require("@saltcorn/data/models/form");
const View = require("@saltcorn/data/models/view");
const db = require("@saltcorn/data/db");
const Workflow = require("@saltcorn/data/models/workflow");
const { renderForm } = require("@saltcorn/markup");
const { div, script, domReady, style } = require("@saltcorn/markup/tags");
const fs = require("fs").promises;
const path = require("path");

const configuration_workflow = () =>
  new Workflow({
    steps: [
      {
        name: "Directories",
        form: async (context) => {
          return new Form({
            fields: [
              {
                name: "base_server_dir",
                label: "Base server directory",
                type: "String",
                required: true,
              },
              {
                name: "file_url_prefix",
                label: "File URL prefix",
                type: "String",
                required: true,
              },
              {
                name: "show_hidden",
                label: "Show hidden files",
                type: "Bool",
              },
              {
                name: "shared_drive_name",
                label: "Name of shared drive",
                sublabel: "Name of root folder shown to user",
                type: "String",
              },
            ],
          });
        },
      },
    ],
  });

const run = async (
  table_id,
  viewname,
  { base_server_dir, file_url_prefix, shared_drive_name },
  state,
  { res, req }
) => {
  const rndid = `fb${Math.floor(Math.random() * 16777215).toString(16)}`;

  return (
    div({ id: rndid }) +
    script(
      domReady(
        `switch_to_dir("${rndid}", "${viewname}", "/", "${
          req.query._select || ""
        }")`
      )
    ) +
    style(`#${rndid} td a {width: 100%;display: block;}`)
  );
};

const get_directory = async (
  table_id,
  viewname,
  { base_server_dir, file_url_prefix, show_hidden, shared_drive_name },
  body,
  { req }
) => {
  const _select = body._select;
  const safeDir = path.normalize(body.dir).replace(/^(\.\.(\/|\\|$))+/, "");
  const dir = path.join(base_server_dir, safeDir);
  const fileNms = await fs.readdir(dir);
  const files = [];
  const breadcrumbs = [
    {
      name: shared_drive_name || "Base",
      link: `javascript:switch_to_dir('${body.id}', '${viewname}', '/', '${_select}');`,
    },
  ];
  if (safeDir !== "/")
    files.push({
      name: "..",
      isDirectory: true,
      size: 0,
      ctime: "",
      link: `javascript:switch_to_dir('${
        body.id
      }', '${viewname}', '/${path.join(safeDir, "..")}');`,
    });
  const dirs = safeDir.split("/");

  dirs.forEach((dir, ix) => {
    if (dir) {
      if (ix === dirs.length - 1) {
        breadcrumbs.push({
          name: dir,
        });
      } else {
        const pth = path.join(...dirs.slice(0, ix + 1));
        breadcrumbs.push({
          name: dir,
          link: `javascript:switch_to_dir('${body.id}', '${viewname}', '/${pth}', '${_select}');`,
        });
      }
    }
  });
  for (const name of fileNms) {
    if (name.startsWith(".") && !show_hidden) continue;
    const stat = await fs.stat(path.join(dir, name));
    const isDirectory = stat.isDirectory();
    files.push({
      name,
      isDirectory,
      size: stat.size,
      ctime: stat.ctime,
      link: isDirectory
        ? `javascript:switch_to_dir('${body.id}', '${viewname}', '${path.join(
            safeDir,
            name
          )}', '${_select}');`
        : _select
        ? `javascript:select_shared_link('${path.join(
            safeDir,
            name
          )}', '${_select}');`
        : path.join(file_url_prefix, safeDir, name),
    });
  }
  return { json: { files, breadcrumbs } };

  //return { json: { error: "Form incomplete" } };
};
module.exports = {
  name: "Shared file browser",
  display_state_form: false,
  tableless: true,
  description: "Browse files in a shared drive",
  get_state_fields: () => [],
  configuration_workflow,
  run,
  routes: { get_directory },
};
