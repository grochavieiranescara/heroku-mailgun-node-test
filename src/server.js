import express from "express";
import "dotenv/config";
import mg from "mailgun-js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let emailTemplate = "";

fs.readFile(
  __dirname + "/resources/email-example.html",
  "utf8",
  function (err, data) {
    if (err) throw err;
    emailTemplate = data;
  }
);

const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/email", (req, res) => {
  const { email, subject, message } = req.body;
  mailgun()
    .messages()
    .send(
      {
        from: "HerokuAppMail <herokuappmail@mg.yourdomain.com>",
        to: `${email}`,
        subject: `${subject}`,
        html: emailTemplate.replace("{{name}}", message),
      },
      (error, body) => {
        if (error) {
          console.log(error);
          res.status(500).send({
            message: "Erro ao enviar o email...",
          });
        } else {
          console.log(body);
          res.status(200).send({
            message: "Email enviado com sucesso!",
          });
        }
      }
    );
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
