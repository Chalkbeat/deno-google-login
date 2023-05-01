import google from "npm:@googleapis/sheets";
import * as path from "https://deno.land/std@0.185.0/path/mod.ts";
import { Server, serve } from "https://deno.land/std@0.185.0/http/server.ts"

var homeDir = path.fromFileUrl(`file://${Deno.env.get("HOME")}`);
var tokenFilePath = path.join(homeDir, ".google_oauth_token");

var clientID = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
var secret = Deno.env.get("GOOGLE_OAUTH_CONSUMER_SECRET");

export * as google from "npm:@googleapis/sheets";

export async function login() {
  var token = {};
  var auth = new google.auth.OAuth2(clientID, secret, "http://localhost:8000/authenticate/");
  try {
    token = JSON.parse(await Deno.readTextFile(tokenFilePath));
    auth.setCredentials(token);
  } catch (err) {
    return authenticate(auth);
  }

  auth.on("tokens", function(update) {
    Object.assign(tokens, update);
    Deno.writeTextFile(tokenFilePath, JSON.stringify(tokens, null, 2));
  });

  return auth;
}


function authenticate(client) {

  var scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ];
  var authURL = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
    prompt: "consent"
  });

  return new Promise((ok, fail) => {
    var handler = async function(request) {
      var url = new URL(request.url);
      switch (url.pathname) {
        case "/authorize":
          return new Response("", {
            status: 302,
            headers: {
              Location: authURL
            }
          });

        case "/authenticate/":
          var code = url.searchParams.get("code");
          var validated = await client.getToken(code);
          var token = validated.tokens;
          await Deno.writeTextFile(tokenFilePath, JSON.stringify(token, null, 2));
          ok(client);
          setTimeout(() => server.close());
          console.log("Successfully authenticated!");
          return new Response("Authenticated!");

        default: return new Response("", { status: 404 });
      }
    };

    var server = new Server({ port: 8000, handler });
    server.listenAndServe();
    console.log(`Login required: visit http://localhost:8000/authorize to connect your account`);
  });
}
