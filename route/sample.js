const express = require('express')
const router = express.Router()
const { createTask } = require('../mongodb')
const { getTask } = require('../mongodb')
const { deleteTasks } = require('../mongodb')
const { updateTask } = require('../mongodb')
const { getCompletedTask } = require('../mongodb')
const { getLoginUser } = require('../mongodb')
const { createUser } = require('../mongodb')
const { checkEmailUnique } = require('../mongodb')

router.get("/getTask/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const tasks = await getTask(userId);
        res.json(tasks);
    } catch (error) {
        console.error('Error when getting tasks', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/getCompletedTask/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const tasks = await getCompletedTask(userId);
        res.json(tasks);
    } catch (error) {
        console.error('Error when getting completed tasks', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/login/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log(email)
        const user = await getLoginUser(email);
        console.log(user)
        if (user) {
            res.json({ message: 'Login successful', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error logging in', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/checkEmailUnique/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const isUnique = await checkEmailUnique(email);
        res.json({ isUnique });
    } catch (error) {
        console.error('Error while checking email uniqueness:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/postTask", async (req, res) => {
    try {
        const { title, content, difficulty, isCompleted,userId } = req.body
        const tasks = await createTask(title, content, difficulty, isCompleted,userId)

        res.status(200).json({ message: 'Task created succesfully', tasks })
    }
    catch (error) {
        console.error('Error when create a task', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post("/postUser", async (req, res) => {
    try{
        const {name, email , password}= req.body
        const user= await createUser(name, email, password)

        res.status(200).json({message:'User created sucessfully', user})
    }
    catch(error){
        console.error('Error when creating user',error)
        res.status(500).json({message:'Internal server error'})
    }
})

router.delete('/deleteTask/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteTasks(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error while deleting task', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/patchTask/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;
        const updated = await updateTask(id, isCompleted);
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error while updating task', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;