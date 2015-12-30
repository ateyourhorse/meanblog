Dockerized mean stack microblog

1. Build the node app container: 
  * docker build -t meanblog .
2. Start the mongodb container: 
  * docker run --name myMongo -d mongo
3. Start the node app container: 
  * docker run -it --link myMongo:mongodb --name "myMeanBlog" -p 3000:3000 meanblog 
4. Open http://localhost:3000 in your browser
