import express from "express";
import { MongoClient} from "mongodb"


const app =express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))



const HTTP_PORT = process.env.PORT || 8001;

const uri = 'mongodb://127.0.0.1:27017';

const withDB = async(operations, res) => {

  try {
    
    const client = new MongoClient(uri);
    await client.connect(); 
    const db = client.db("my-blog"); 
    
    await operations(db); 
    
    await client.close();

  } catch (error) {
    res.status(500).json({ message: "error connecting to db: ", error });
  }

}


app.get('/api/articles/:name', async (req,res)=>{

  withDB(async(db)=>{
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json({articleInfo})
  },res)
   
})


app.post('/api/articles/:name/upvote',async (req,res) =>{
    
  withDB(async (db)=>{
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({ name: articleName });  
    await db.collection('articles').updateOne({ name: articleName },{
    '$set': {
      upvotes: articleInfo.upvotes +1,
    },
  });
  const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

  res.status(200).json({updatedArticleInfo})
  }, res)
  
})

app.post('/api/articles/:name/add-comment',(req,res)=>{
    
    withDB(async (db)=>{
      const articleName = req.params.name;
      const {username,text} = req.body;
    
      const articleInfo = await db.collection('articles').findOne({ name: articleName });  
      await db.collection('articles').updateOne({ name: articleName },{
      '$set': {
        comments: articleInfo.comments.concat({username,text})
      },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
  
    res.status(200).json({updatedArticleInfo})
    }, res)


})

app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`)
})