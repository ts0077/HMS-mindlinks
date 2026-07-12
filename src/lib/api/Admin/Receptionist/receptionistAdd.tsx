import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { receptionistEndpoints } from './receptionistEndpoints'

type dataprops = {
    username: string
    password: string
   
}


export default async function receptionistAddApi ({username,password}:dataprops,token:string){
const url = HMS_Base_Url + receptionistEndpoints.Add

try{
 const res = await axios.post (url,
    {
        username,
        password
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