import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { dosageEndpoints } from './dosageEndpoints'

type dataprops = {
    dosageInstruction: string
   dosageInstructionID: number
}


export default async function dosageUpdateApi ({dosageInstruction,dosageInstructionID}:dataprops,token:string){
const url = HMS_Base_Url + dosageEndpoints.Update

try{
 const res = await axios.post (url,
    {
        dosageInstruction,
        dosageInstructionID
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