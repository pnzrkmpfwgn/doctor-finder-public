/* eslint-disable */
import {useRef} from 'react';
import { login } from "../firebase/firebase"
import {useRouter} from 'next/router';

export default function SupportAgentLogin () {
    const email = useRef();
    const password = useRef();
    const router = useRouter();

    const handleLogin = () => {
        login(email.current.value,password.current.value);
        router.push("/UA0d1d84d5-26c5-4d4a-9c41-da7f1e636d3c")
    }

    return<>
        <input type="email" ref={email} placeholder="Email" /> <br /> <br />
        <input type="password" ref={password} placeholder="Password" /> <br /> <br />
        <button onClick={()=>handleLogin()} >Login</button>
    </>
}