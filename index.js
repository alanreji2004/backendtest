const express = require('express');
const app = express();
const PORT = 3000;
const {db} = require('./firebase');
app.use(express.json());



app.get('/',(req,res)=>{
    res.json({message : 'Message from express server'});
});

app.post('/messages',async(req,res)=>{
    try{
        const data = req.body;
        const docRef = await db.collection('messages').add(data);
        res.status(201).json({id : docRef.id});
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
});

app.get('/messages/name', async(req,res)=>{
    try{
        const name = req.query.name?.toLowerCase() || ' ';
        const snapshot = await db.collection('messages').get();

        const results = snapshot.docs
            .map(doc => ({id : doc.id, ...doc.data()}))
            .filter(user => user.name?.toLowerCase().includes(name));
        res.status(201).json(results);
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
});

app.put('/messages/update',async (req,res)=>{
    try{
        const {name, email, newMessage} = req.query;
        if(!name || !email || !newMessage){
            return res.status(400).json({message : 'Required number of parameters didnt matched'});
        }
        const snapshot = await db.collection('messages').get();
        const matchedUser = snapshot.docs
            .map(doc =>({id : doc.id,...doc.data()}))
            .find(user => user.name?.trim().toLowerCase() === name.trim().toLowerCase() && user.email === email);


        if(matchedUser){
            await db.collection('messages').doc(matchedUser.id).update({
                message : newMessage
            });
            res.json(200).json({message : 'message updated successully'});
        }else{
            res.json(404).json({message : 'User not found'});
        }
    }
    catch(err){
        res.status(500).json({message : err.message});
    }
});

app.listen(PORT,()=>{
    console.log(`server is listening to port ${PORT}`);
});