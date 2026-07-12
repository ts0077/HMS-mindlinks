import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { premorbidEndpoints } from './premorbidEndpoints'

type premorbidprops = {
    premorbid: string
    premorbidID: number
}


export default async function premorbidUpdateApi ({premorbid,premorbidID}:premorbidprops,token:string){
const url = HMS_Base_Url + premorbidEndpoints.Update

try{
 const res = await axios.post (url,
    {
        premorbidID,
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