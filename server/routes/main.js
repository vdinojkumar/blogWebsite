const express=require('express')
const router=express.Router();
const Post=require('../model/Post')

// get route 
router.get('',async (req,res)=>{
    
    try {
      const locals={
        title:"node blog website",
        description:"simple website"
    }

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{$sort: {createdAt : -1}}]).skip(perPage * page - perPage).limit(perPage).exec();
        

    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index',{
          locals,
          data,
          current: page,
          nextPage : hasNextPage ? nextPage : null,
        });

    } catch (error) {
        console.log(error);
    }
})

// get post by Id

router.get('/post/:id', async(req,res)=>{
  
  try {
    let slug= req.params.id;

    const locals={
      title :" Node js blogs",
      description:"simple blogs"
    }
    

    const data = await Post.findById({_id : slug})


   
    res.render('post',{locals,data});

  } catch (error) {
    console.log(error);
  }
})

//Post route / post - search Term

router.post('/search',async (req,res)=>{
  
    try {
      const locals={
        title:"node blog website",
        description:"simple website"
      }


      let searchTerm= req.body.searchTerm;
      const searchNospecialchar=searchTerm.replace(/[^a-zA-Z0-9]/g,"")

      const data= await Post.find({
        $or:[
          {title:{$regex : new RegExp(searchNospecialchar,'i')}},
          {body:{$regex : new RegExp(searchNospecialchar,'i')}}
        ]
      });
      res.render('search',{
        data,
        locals
      })

    } catch (error) {
        console.log(error);
  }
})




router.get('/about',(req,res)=>{
  res.render('about')
})

router.get('/contact',(req,res)=>{
  res.render('contact')
})



module.exports=router 