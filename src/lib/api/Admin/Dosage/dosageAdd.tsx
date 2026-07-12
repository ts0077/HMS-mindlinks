import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { dosageEndpoints } from './dosageEndpoints'

type dataprops = {
    dosageInstruction: string
   
}


export default async function dosageAddApi ({dosageInstruction}:dataprops,token:string){
const url = HMS_Base_Url + dosageEndpoints.Add

try{
 const res = await axios.post (url,
    {
        dosageInstruction
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