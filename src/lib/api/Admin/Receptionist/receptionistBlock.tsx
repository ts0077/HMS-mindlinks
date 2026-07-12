import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { receptionistEndpoints } from './receptionistEndpoints'

type dataprops = {
    username: string
    
   
}


export default async function receptionistBlockApi ({username}:dataprops,token:string){
const url = HMS_Base_Url + receptionistEndpoints.Block + username

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