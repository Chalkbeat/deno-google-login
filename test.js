import { login, google } from "./index.js";

var auth = await login();
var sheets = google.sheets("v4");
var { data } = await sheets.spreadsheets.values.get({
  auth,
  spreadsheetId: "1PUWVVtRwmx5_XlD2brZJ_lpeVvBI6FLGRyn0AMtHKIE",
  range: "bills!A:Z"
});
console.log(data.values);