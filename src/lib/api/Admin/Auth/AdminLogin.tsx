import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { Admin_AuthenticationEndpoints } from './Admin-AuthenticationEndpoints'

export default async function AdminLoginApi (username:string, password:string){
const url = HMS_Base_Url + Admin_AuthenticationEndpoints.login

try{
 const res = await axios.post (url,
    {
        username:username,
        password: password
    }
    ,{
    headers:{
        "Content-Type" : "application/json",
        Accept: "*/*",
       
    }
 })
 return res.data
}
catch(error)
{
     ErrorHandles(error);
    throw error
}

}