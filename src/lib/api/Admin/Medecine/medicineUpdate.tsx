import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { medicineEndpoints } from './medicineEndpoints'

type dataprops = {
    medicine: string
    medicineID: number
   
}


export default async function medicineUpdateApi ({medicine,medicineID}:dataprops,token:string){
const url = HMS_Base_Url + medicineEndpoints.Update

try{
 const res = await axios.post (url,
    {
        medicine,
        medicineID
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