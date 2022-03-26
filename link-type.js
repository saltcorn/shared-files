const View = require("@saltcorn/data/models/view");
const { getState } = require("@saltcorn/data/db/state");
const {
  a,
  div,
  script,
  domReady,
  style,
  input,
  text_attr,
} = require("@saltcorn/markup/tags");

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

        return a({ href: file_url_prefix + v }, v);
      },
    },
    edit: {
      isEdit: true,
      run: (nm, v, attrs, cls, required, field) => {
        const { browser } = attrs;
        const browser_view = getState().views.find((v) => v.name === browser);

        if (!browser_view)
          throw new Error(`SharedFileLink: browser view ${browser} not found`);
        const { base_server_dir, file_url_prefix, show_hidden } =
          browser_view.configuration;
        return input({
          type: "text",
          disabled: attrs.disabled,
          class: ["form-control", cls],
          readonly: "readonly",
          "data-fieldname": text_attr(field.name),
          name: text_attr(nm),
          onFocus: `sharedLinkSelect('${nm}', '${browser}')`,
          id: `input${text_attr(nm)}`,
          value: text_attr(v || ""),
        });
      },
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
