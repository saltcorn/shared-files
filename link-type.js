const View = require("@saltcorn/data/models/view");
const { getState } = require("@saltcorn/data/db/state");
const { a, div, script, domReady, style } = require("@saltcorn/markup/tags");

module.exports = {
  name: "SharedFileLink",
  sql_name: "text",
  fieldviews: {
    show: {
      isEdit: false,
      run: (v, req, { browser }) => {
        if (!v) return "";
        const browser_view = getState().views.find((v) => v.name === browser);

        if (!browser_view)
          throw new Error(`SharedFileLink: browser view ${browser} not found`);
        const { base_server_dir, file_url_prefix, show_hidden } =
          browser_view.configuration;

        console.log({ browser_view });
        return a({ href: file_url_prefix + v }, v);
      },
    },
    editHTML: {
      isEdit: true,
      run: (nm, v, attrs, cls) =>
        /*textarea(
          {
            class: ["form-control", cls],
            name: text(nm),
            id: `input${text(nm)}`,
            rows: 10,
          },
          xss(v || "")
        ),*/
        "",
    },
  },
  attributes: () => {
    const views = getState()
      .views.map((t) => new View(t))
      .filter((v) => v.viewtemplate === "Shared file browser");
    return [
      {
        name: "browser",
        label: "Shared file browser view",
        type: "String",
        attributes: { options: views.map((v) => v.name) },
      },
    ];
  },

  read: (v) => {
    switch (typeof v) {
      case "string":
        return v;
      default:
        return undefined;
    }
  },
};
