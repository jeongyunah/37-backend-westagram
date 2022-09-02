require("dotenv").config();

const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { DataSource } = require("typeorm");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const appDataSource = new DataSource({
  type : process.env.TYPEORM_CONNECTION,
  host : process.env.TYPEORM_HOST,
  port : process.env.TYPEORM_PORT,
  username : process.env.TYPEORM_USERNAME,
  password : process.env.TYPEORM_PASSWORD,
  database : process.env.TYPEORM_DATABASE
}) 

appDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err)
    });

app.get('/ping', cors(), function(req, res, next){
  res.json({message : 'pong'})
})

app.post("/users", async(req, res, next) => {
  const { name, email, profile_image, password} = req.body;
  await appDataSource.manager.query(
    `SELECT *
    FROM users
    WHERE users.email = "${email}"`
    ,async (err, rows) => { // async 자동으로 생성되는데 왜 그러는건가요?
      if(Object.keys(rows).length == 0){
        await appDataSource.query(`INSERT INTO users(
          name, 
          email, 
          profile_image, 
          password
          )values(?, ?, ?, ?);`,
        [name, email, profile_image, password]
      );
      res.status(200).json({"message" : "userCreated"});
      }
      else 
      res.status(200).json({"message" : "fail"});
    }
  )
});

const start = async () => {
  server.listen(PORT, () => console.log(`erviser is listening on  ${PORT}`))
}
start();