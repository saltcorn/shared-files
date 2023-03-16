const View = require("@saltcorn/data/models/view");
const { getState } = require("@saltcorn/data/db/state");
const {
  a,
  div,
  script,
  domReady,
  style,
  i,
  input,
  button,
  text_attr,
} = require("@saltcorn/markup/tags");
const path = require("path");

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
    show_image: {
      isEdit: false,
      run: (v, req, { browser }) => {
        if (!v) return "";
        const browser_view = getState().views.find((v) => v.name === browser);

        if (!browser_view)
          throw new Error(`SharedFileLink: browser view ${browser} not found`);
        const { base_server_dir, file_url_prefix, show_hidden } =
          browser_view.configuration;

        return img({ src: file_url_prefix + v });
      },
    },
    edit: {
      isEdit: true,
      configFields: () => [
        {
          name: "file_type",
          label: "File type",
          type: "String",
          attributes: {
            options: ["Only files", "Only folders", "Files and folders"],
          },
        },
        {
          name: "start_path",
          label: "Start path",
          type: "String",
        },
        {
          name: "editable",
          label: "Manual edit",
          sublabel: "allow user to manually enter or edit a path",
          type: "Bool",
        },
      ],
      run: (nm, v, attrs, cls, required, field) => {
        const { browser } = attrs;
        const browser_view = getState().views.find((v) => v.name === browser);

        if (!browser_view)
          throw new Error(`SharedFileLink: browser view ${browser} not found`);
        const { base_server_dir, file_url_prefix, show_hidden } =
          browser_view.configuration;
        const start_path = v ? path.dirname(v) : attrs?.start_path || "/";
        const main_input = input({
          type: "text",
          disabled: attrs.disabled,
          class: ["form-control", cls],
          readonly: "readonly",
          "data-fieldname": text_attr(field.name),
          name: text_attr(nm),
          onFocus: `sharedLinkSelect('${nm}', '${browser}', this, '${
            attrs?.file_type || "Only files"
          }', '${start_path}')`,
          id: `input${text_attr(nm)}`,
          value: text_attr(v || ""),
        });
        if (attrs?.editable) {
          return div(
            { class: "input-group" },
            main_input,
            button(
              {
                class: "btn btn-sm btn-outline-secondary",
                onclick: `manual_edit_shared_link('input${text_attr(nm)}')`,
                type: "button",
              },
              i({ class: "far fa-edit" })
            )
          );
        }
        return main_input;
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
