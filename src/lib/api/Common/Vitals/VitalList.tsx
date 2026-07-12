import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { VitalEndpoints } from './VitalEdnpoints'

export default async function VitalListApi (visitID:number,token:string){
const url = HMS_Base_Url + VitalEndpoints.List

try{
 const res = await axios.get(url,
   {
    params: {
visitID
    },
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