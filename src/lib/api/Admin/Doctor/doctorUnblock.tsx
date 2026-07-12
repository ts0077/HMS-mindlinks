import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { doctorEndpoints } from './doctorEndpoints'

type dataprops = {
    username: string
}


export default async function doctorUnBlockApi ({username}:dataprops,token:string){
const url = HMS_Base_Url + doctorEndpoints.UnBlock + username

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