export const signup = (req , res)=>
{
    try{
    console.log(req);
    const data = req.body;
    console.log(data);
    res.status(200)
    .json({message : "function runs correctly"})
    }
    catch(error){
        console.error("signup not successfully")
    }
}
