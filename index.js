module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "shared-files",
  viewtemplates: [require("./file-browser.js")],
  headers: [
    {
      script: "/plugins/public/shared-files/shared-files-client.js",
    },
  ],
  types: [require("./link-type.js")],
};
