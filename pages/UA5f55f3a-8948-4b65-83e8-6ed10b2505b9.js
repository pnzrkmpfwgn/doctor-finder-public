/* eslint-disable */
import {useRef} from 'react';
import {signUpAsSupportAgent} from '../firebase/firebase'
import {useRouter} from 'next/router';
export default function UserAgentSignUp(){
    const email = useRef();
    const password = useRef();
    const name = useRef();
    const surname = useRef();
    const router = useRouter();
    
    const handleSubmit = () => {
        signUpAsSupportAgent(email.current.value,password.current.value,name.current.value,surname.current.value);
        router.push("/UA0d1d84d5-26c5-4d4a-9c41-da7f1e636d3c")
    }

    return <>
        <h1>User Agent Sign Up</h1>
        <input type='email' ref={email} placeholder='Email' /> <br /> <br />
        <input type='password' ref={password} placeholder='Password' /> <br /> <br />
        <input ref={name} placeholder='Name' /> <br /> <br />
        <input  ref={surname} placeholder='Surname' /> <br /> <br />
        <button onClick={()=>handleSubmit()} >Sign Up</button>
    </>
}