import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { diagnosisEndpoints } from './diagnosisEndpoints'

type dataprops = {
    diagnosis: string
    diagnosisID: number
   
}


export default async function diagnosisUpdateApi ({diagnosis,diagnosisID}:dataprops,token:string){
const url = HMS_Base_Url + diagnosisEndpoints.Update

try{
 const res = await axios.post (url,
    {
        diagnosis,
        diagnosisID
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