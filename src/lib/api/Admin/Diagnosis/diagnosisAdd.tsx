import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { diagnosisEndpoints } from './diagnosisEndpoints'

type dataprops = {
    diagnosis: string
   
}


export default async function diagnosisAddApi ({diagnosis}:dataprops,token:string){
const url = HMS_Base_Url + diagnosisEndpoints.Add

try{
 const res = await axios.post (url,
    {
        diagnosis
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