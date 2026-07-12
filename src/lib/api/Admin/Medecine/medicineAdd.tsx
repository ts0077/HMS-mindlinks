import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { medicineEndpoints } from './medicineEndpoints'

type dataprops = {
    medicine: string
   
}


export default async function medicineAddApi ({medicine}:dataprops,token:string){
const url = HMS_Base_Url + medicineEndpoints.Add

try{
 const res = await axios.post (url,
    {
        medicine
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