document.addEventListener('DOMContentLoaded', async function() {
    main.hidden=true
});

const main=document.querySelector('.main');
const loginContainer=document.querySelector('#loginForm');
const registrationContainer=document.querySelector('#registrationForm');
document.querySelector('#loginBtn').addEventListener("click", login);


document.querySelector('#registerBtn').addEventListener("click", registration);

document.querySelector(".addBtn").addEventListener("click", function() {
    addBtn();
});

document.querySelector(".changeBtn").addEventListener("click", function() {
    changeBtn();
});

document.querySelector("#cancel").addEventListener("click", function() {
    cancelBtn();
});



var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
}

function toggleForm() {
    var loginForm = document.getElementById('loginForm');
    var registrationForm = document.getElementById('registrationForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
    }
}

async function login() {
    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;

    try {
        user = await Login(loginEmail);

        if (user) {
            console.log(user.password);
            if (user.password === loginPassword) {
                loginContainer.style.display='none'
                loginContainer.hidden = true;
                main.hidden = false;
                alert('Login successful');
                await getTasks(user._id);
                await getCompletedTasks(user._id);
            } else {
                alert('Incorrect password');
            }
        } else {
            alert('User not found');
        }
    } catch (error) {
        console.error('Error logging in', error);
    }

    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

document.querySelector("#submit").addEventListener("click", function() {
 
    if (!user) {
        console.error('User is not defined');
        return;
    }

    const userId = user._id;
    console.log(userId);
    postTask(userId);
    $('.dialog').attr('close', true);
});


async function registration() {
    const nameInput = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    const isUnique = await checkEmailUnique(email);
    
    if (!isUnique) {
        alert('Email is already in use. Please choose a different email.');
        return;
    }

    await Registration(name, email, password);
    alert('Registration was successful');

 
    const newUser = await Login(email);
    if (newUser) {
        await getTasks(newUser._id);
        await getCompletedTasks(newUser._id);

     
        registrationContainer.style.display = 'none';
        main.hidden = false;
    } else {
        console.error('Error: User not found after registration');
    }

    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
}




function changeBtn() {
    loginContainer.style.display='block'
    loginContainer.hidden=false
    main.hidden=true;
}

function addBtn() {
    $('.dialog').attr('close', false);
    $('.dialog').attr('open', true);

}

function cancelBtn() {
    $('.dialog').attr('open', false)
    $('.dialog').attr('close', true)

}

async function postTask(userId) {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    const isCompleted = false;

    let difficulty;
    if (selectedDifficulty) {
        difficulty = selectedDifficulty.value;
    } else {
        console.error('No difficulty selected!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/postTask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content, difficulty, isCompleted,userId })
        });
        const data = await response.json();
        document.getElementById('postResponse').innerText = JSON.stringify(data);

        await getTasks(userId);


        await getCompletedTasks(userId);

        cancelBtn();

    } catch (error) {
        console.error('Error:', error);
    }
}

async function getTasks(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getTask/${userId}`);
        const data = await response.json();

        const taskList = document.getElementById('myUL');
        taskList.innerHTML = '';

        const incompleteTasks = data.filter(task => !task.isCompleted);

        incompleteTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.textContent = `Title:${task.title},  Content:${task.content},  Difficulty:${task.difficulty}`;
            const completeButton = document.createElement('button')
            completeButton.className = 'complete-button'
            completeButton.innerHTML = '<i class="fas fa-check"></i>'
            completeButton.addEventListener('click', async() => {
                await patchTask(task._id);
                await getTasks(userId);
                await getCompletedTasks(userId);
            })
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', async() => {
                await deleteTask(task._id);
                await getTasks(userId);
            });

            listItem.appendChild(deleteButton);
            listItem.appendChild(completeButton);

            taskList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getCompletedTasks(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCompletedTask/${userId}`);
        const completedTasks = await response.json();

        const taskList = document.getElementById('completedUL');
        taskList.innerHTML = '';

        completedTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.textContent = `Title: ${task.title}, Content: ${task.content}, Difficulty: ${task.difficulty}`;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', async() => {
                await deleteTask(task._id);
                await getCompletedTasks(userId);
            });

            listItem.appendChild(deleteButton);

            taskList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}




async function deleteTask(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/deleteTask/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function patchTask(id, isCompleted) {
    try {
        const response = await fetch(`http://localhost:3000/api/patchTask/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isCompleted })
        });

    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function Login(loginEmail) {
    try {
        const response = await fetch(`http://localhost:3000/api/login/${loginEmail}`);
        const data = await response.json();
        return data.user; 
    } catch (error) {
        console.error('Error logging in', error);
    }
}


async function Registration(name, email, password) {
    try {
        const response = await fetch(`http://localhost:3000/api/postUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        })
    } catch (error) {
        console.error('Error registering', error);
    }
}

async function checkEmailUnique(email) {
    try {

        const response = await fetch(`http://localhost:3000/api/checkEmailUnique/${email}`);
        const data = await response.json();
        

        return data.isUnique;
    } catch (error) {
        console.error('Error checking email uniqueness:', error);
        return false;
    }
}