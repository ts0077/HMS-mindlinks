import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { diagnosisEndpoints } from './diagnosisEndpoints'



export default async function diagnosisDeleteApi (id: number ,token:string){
const url = HMS_Base_Url + diagnosisEndpoints.Delete + id

try{
 const res = await axios.post (url,{},
    {
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