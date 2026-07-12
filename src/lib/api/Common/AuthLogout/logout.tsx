import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'


export default async function LogoutApi (token:string){
const url = HMS_Base_Url +  "/api/Auth/logout"

try{
 const res = await axios.post (url,
    {
    }
    ,{
    headers:{
        "Content-Type" : "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${token}`
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