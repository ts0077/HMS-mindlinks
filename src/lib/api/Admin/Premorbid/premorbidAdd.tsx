import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { premorbidEndpoints } from './premorbidEndpoints'

type premorbidprops = {
    premorbid: string
}


export default async function premorbidAddApi ({premorbid}:premorbidprops,token:string){
const url = HMS_Base_Url + premorbidEndpoints.Add

try{
 const res = await axios.post (url,
    {
        premorbid
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