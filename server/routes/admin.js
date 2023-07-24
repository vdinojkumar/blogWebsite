const express = require('express');
const router = express.Router();
const Post = require('../model/Post');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout='../views/layouts/admin'
const jwtsecret = process.env.JWT_SECRET

/**
 * 
 * Check LogIn
 * 
 */
const authMiddleware=(req,res,next)=>{
  const token = req.cookies.token;

  if(!token){
    return res.status(401).json({message : 'Unauthorised'})
  }
  try {
    const decoded = jwt.verify(token , jwtsecret);
    req.userId = decoded.userId;
    next()
  } catch(error) {
    res.status(401).json({message:'Unauthorised'});
  }
}






/**
 * Get /
 * Admin - Login Page
 */

router.get('/admin', async(req, res)=>{
    try {
        const locals={
            title:"Admin",
            description : "Simple Blog Created with NodeJs and Express & Mongo Db."
        }

        res.render('admin/index',{locals, layout :adminLayout}); 
    } catch (error) {
        console.log(error);
    }
})
/**
 * Post /
 * Admin - login check
 */

router.post('/admin', async(req, res)=>{
    try {
        const{username, password}=req.body

        const user = await User.findOne({username});

        if(!user){
          return res.status(401).json({message :'Invalid credintials'})
        }

        const ispassword= await bcrypt.compare(password, user.password)

        if(!ispassword){
          return res.status(401).json({message:'Invalid credentials'})
        }


        const token = jwt.sign({userId : user._id}, jwtsecret )

        res.cookie('token' , token , { httpOnly :true});
        res.status(201).redirect('/dashboard');
        
    } catch (error) {
        console.log(error);
    }
})

/**
 * GET /
 * /Admin Dashboard
 */

router.get('/dashboard', authMiddleware, async(req, res)=>{

  try {
    const locals={
      title : 'DashBoard',
      description:'Simple Blog created with Node js , Express & MongODb'
    }
    const data = await Post.find();
    res.render('admin/dashboard',{
      locals , data ,layout :adminLayout
    });

  } catch (error) {
    console.log(error);
  }
})

/**
 * GET /
 * / Admin - Create New Post
 */

router.get('/add-post', authMiddleware , async(req, res)=>{

  try {
    const locals={
      title : 'AddPost',
      description:'Simple Blog created with Node js , Express & MongODb'
    }
    const data = await Post.find();
    res.render('admin/add-post',{
      locals , data ,layout : adminLayout
    });

  } catch (error) {
    console.log(error);
  }
})

/**
 * post /
 * / Admin - Create New Post
 */

router.post('/add-post', authMiddleware , async(req, res)=>{

  try {
    console.log(req.body)

    try {
      const newPost= new Post({
        title:req.body.title,
        body : req.body.body,
      }) 
      
      await Post.create(newPost);
      res.redirect('/dashboard')

    } catch (error) {
      console.log(error)
    }
    

  } catch (error) {
    console.log(error);
  }
  

})


// /**
//  * GET /
//  * / Admin - Create New Post
//  */

router.get('/edit-post/:id', authMiddleware , async(req, res)=>{

  try {
    const locals={
      title:"edit Post",
      description:"NODE js blog website"
    }
    const data =await Post.findOne({_id: req.params.id})

    res.render('admin/edit-post',{
      layout:adminLayout,
      data,
      locals
    })

  } catch (error) {
    console.log(error);
  }
})



/**
 * PUT /
 * / Admin - Create New Post
 */

router.put('/edit-post/:id', authMiddleware , async(req, res)=>{

  try {
    await Post.findByIdAndUpdate(req.params.id,{
      title:req.body.title,
      body:req.body.body,
      updatedAT : Date.now(),
    })

    res.redirect(`/edit-post/${req.params.id}`)

  } catch (error) {
    console.log(error);
  }
})




/**
 * Post/
 * Admin - Register
 */
router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password , 10 )
      try {
        const user = await User.create({ username , password : hashedPassword });
        res.status(201).json({ message: 'User Created', user });
      } catch (error) {
        if(error.code === 11000) {
          res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({ message: 'Internal server error'})
      }
  
    } catch (error) {
      console.log(error);
    }
  });


// /**
//  * DELETE /
//  * / Admin - DELET New Post
//  */

router.delete('/delete-post/:id', authMiddleware , async(req, res)=>{
try {
  await Post.deleteOne({_id : req.params.id});
  res.redirect('/dashboard');
} catch (error) {
  console.log(error);
}
})


router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  res.redirect('/')
})

module.exports=router