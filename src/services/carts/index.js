const express = require("express")
const path = require("path")
const uniqid = require("uniqid")
const fs = require("fs")
const  {writeFile,createReadStream} = require("fs-extra")
const { readDB, writeDB } = require("../../lib/utilites")
const { check, validationResult } = require("express-validator")

const router = express.Router()
const cartsFilePath = path.join(__dirname, "carts.json")
const productsFilePath = path.join(__dirname, "../products/products.json")
const readFile = fileName =>{

    const buffer = fs.readFileSync(path.join(__dirname,fileName))
    const fileContent = buffer.toString()
    return JSON.parse(fileContent)
}

const addTotalProperty = async (cartId,productId)=>{
    const productsArray = readFile("../products/products.json");
    let product = productsArray.find((product)=>product._id ===productId)
    const cartsArray = readFile("carts.json");
      let cart = cartsArray.find((cart)=>cart._id ===cartId)
     
          if(cart.hasOwnProperty('total')){
              console.log(cart.total,"---------")
              console.log(product.price,"----price---")
            cart.total+=parseInt(product.price) 
          }else{
              cart.total=parseInt(product.price) 
          }
      
          fs.writeFileSync(path.join(__dirname,"carts.json"),JSON.stringify(cartsArray))
     
  }
  const addProductProperty = async (cartId,productId)=>{
    const productsArray = readFile("../products/products.json");
    let product = productsArray.find((product)=>product._id ===productId)
    const cartsArray = readFile("carts.json");
      let cart = cartsArray.find((cart)=>cart._id ===cartId)
     
          
             
              console.log(product.price,"----price---")
                cart.products.push(product) 
         
      
          fs.writeFileSync(path.join(__dirname,"carts.json"),JSON.stringify(cartsArray))
     
  }
  

router.get("/:cartId",async(req,res,next)=>{
    try {
        const cartsDB = await readDB(cartsFilePath)
        const cart = cartsDB.filter(cart=>cart._id===req.params.cartId)
        if(cart.length>0){
            res.send(cart)

        }else{
            const err = new Error()
            err.httpStatusCode=404
            next(err)
        }
    } catch (error) {
        console.log(error)
        next(error)
    }

})
router.post("/:cartId/add-to-cart/:productId",async(req,res,next)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const err = new Error()
          err.message = errors
          err.httpStatusCode = 400
          next(err)
        }else{
            
             await addTotalProperty(req.params.cartId,req.params.productId)
             await addProductProperty(req.params.cartId,req.params.productId)
     
            res.status(201).send("okej")
        }
       

        
    } catch (error) {
        console.log(error)
        next(error)
    }
    
})

router.delete ("/:cartId/remove-from-cart/:productId",async(req,res,next)=>{
    try {
        const cartDb = await readDB(cartsFilePath)
    
       
        const cart =  cartDb.filter(cart=>cart._id !==req.params.cartId) // karta qe mka vyjt
        console.log(cart,"----ad----")
        // const newCart = cart.products.filter(product =>product._id !==req.params.productId) //karta pa qat produkt
        
        // const newCardDB =cartDb.filter(cart=>cart._id !==req.params.cartId)
        
        // newCardDB.push(newCart)
        // await writeDB(cartsFilePath,newCardDB)

        res.status(204).send("Product deleted successfully!")
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
      const productsDB = await readDB(productsFilePath)
      const newDb = productsDB.find(product => product._id !== req.params.id)
      await writeDB(productsFilePath, newDb)
  
      res.status(204).send("Product deleted successfully!")
    } catch (error) {
      next(error)
    }
  })




module.exports = router