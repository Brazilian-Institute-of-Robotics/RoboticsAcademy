import { saveContainerManagerPorts, deleteContainerManagerPorts } from "./storeManager";
import { getCookie } from "./cookie";


export const login = async (serverBase, username, password) => {
    try {
        const csrfToken = getCookie("csrftoken")
        //const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const response = await fetch(`${serverBase}/api/v1/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ username, password }),
        });
        if(!response.ok){
            const data = await response.json();
            alert(data["message"]);
        }
        else{
            const data = await response.json();
            //Saves on local storage
            saveContainerManagerPorts(data['container-ports']);
            window.location.href = '/exercises';
        }
    } catch (err) {
        console.log("ERROR: "+err)
        alert('Unexpected error on site: contact developers');
    }finally{}
}

export const logout = async (serverBase) => {
    try {
        const csrfToken = getCookie("csrftoken")
        //const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const response = await fetch(`${serverBase}/api/v1/logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });
        if(!response.ok){
            const data = await response.json();
            alert(data["message"]);
        }
        else{
            //Delete localStorage
            deleteContainerManagerPorts()
            window.location.href = '/login';
        }
    } catch (err) {
        console.log("Error: "+err)
        alert('Unexpected error on site: contact developers');
    }finally{}
}