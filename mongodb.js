const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb');

const uri = "mongodb+srv://zhanikplanet1:narutoplanet@cluster0.zyfk98y.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function connectMongodb() {
    try {
        await client.connect()
        console.log("Connected to Mongodb")
        return client
    }
    catch (error) {
        console.error("Failed to connect to Mongodb", error)
        throw error
    }
}



async function createTask(title, content, difficulty, isCompleted, userId) {
    console.log(`${title},${content},${difficulty},${isCompleted},${userId}`)
    try {
        if (!title || !content || !difficulty)
            throw new Error('Missing required parameters');

        const database = client.db('ToDoList');
        const collection = database.collection('TaskList');

     
        const userIdObj = new ObjectId(userId);

        const result = await collection.insertOne({ title, content, difficulty, isCompleted, userId: userIdObj });
        if (result.acknowledged)
            console.log('You successfully created the task');
        else
            throw Error('No documents inserted');
    }
    catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}


async function createUser(name, email, password) {
    try {
        if (!name || !email || !password)
            throw new Error('Missing required parametres')
        const database = client.db('ToDoList')
        const collection = database.collection('users')
        const result = await collection.insertOne({ name, email, password })
        if (result.acknowledged)
            console.log('You succesfully create user')
        else
            throw Error('No domunets inserted')
    }
    catch (error) {
        console.error('Error while creating new user', error)
    }
}

async function getTask(userId) {
    console.log(userId)
    const userIdObject = new ObjectId(userId);
    try {
        const database = client.db('ToDoList');
        const collection = database.collection('TaskList');
        const result = await collection.find({ userId: userIdObject }).toArray();
        console.log(result)
        return result;
    } catch (error) {
        console.error('Error when retrieving tasks from collection', error);
        throw error;
    }
}

async function getCompletedTask(userId) {
    console.log(userId)
    const userIdObject = new ObjectId(userId);
    try {
        const database = client.db('ToDoList');
        const collection = database.collection('TaskList');
        const result = await collection.find({ userId: userIdObject, isCompleted: true }).toArray(); 
        console.log(result)
        return result;
    } catch (error) {
        console.error('Error when retrieving completed tasks from collection', error);
        throw error;
    }
}


async function getLoginUser(loginEmail) {
    console.log(loginEmail)
    try {
        const database = client.db('ToDoList');
        const collection = database.collection('users');
        const user = await collection.findOne({ email: loginEmail });
        console.log(user)
        return user;
    }
    catch (error) {
        console.error('Error while getting users for login from db', error)
        throw error
    }
}

async function deleteTasks(id) {
    console.log(`${id}`)
    try {
        if (!id)
            throw new Error('Missing required parameter')
        const database = client.db('ToDoList')
        const collection = database.collection('TaskList')
        const result = await collection.deleteOne({ _id: new ObjectId(id) })
        return result.deletedCount > 0
    }
    catch (error) {
        console.error('Error while deleting tasks in db:', error)
        throw error;
    }
}


async function updateTask(id, isCompleted) {
    try {
        const database = client.db('ToDoList');
        const collection = database.collection('TaskList');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isCompleted: true } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error when updating task in db', error);
        throw error;
    }
}

async function checkEmailUnique(email) {
    try {
        const database = client.db('ToDoList');
        const collection = database.collection('users');
        const existingUser = await collection.findOne({ email });
        return !existingUser; 
    } catch (error) {
        console.error('Error while checking email uniqueness:', error);
        throw error;
    }
}


module.exports = { connectMongodb, getTask, deleteTasks, createTask, updateTask, getCompletedTask, getLoginUser,createUser,checkEmailUnique }