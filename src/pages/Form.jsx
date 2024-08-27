import React, { useContext, useState } from 'react'
import Menu from '../Components/Menu'
import axios from 'axios';
import AuthContext from '../context/AuthContext'; 
import AuthComponent from './../Components/AuthComponent';
function Form() {
    const { login } = useContext(AuthContext);
    const [authToken, setAuthToken] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    let [input, setInput] = useState({
        email: '',
        password: ''
    });
    function changeinput(e) {
        e.preventDefault();
        const value = e.target.value;
        const name = e.target.name;
        console.log(name);
        setInput(prevState => ({
            ...prevState,
            [name]: value
        }));
    }
    async function submitForm(e) {
        e.preventDefault();
        try {
            await login(input);
            // Redirect or update UI as needed
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <Menu></Menu>
             <p className='text-danger'></p>
             <p className='text-danger'>Form</p>
                <form onSubmit={submitForm}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input type="email" className="form-control" onChange={changeinput} name='email' aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label  className="form-label">Password</label>
                        <input type="password" className="form-control" onChange={changeinput} name='password' />
                    </div>
                   
                    <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                </div>
    )
}

export default Form
