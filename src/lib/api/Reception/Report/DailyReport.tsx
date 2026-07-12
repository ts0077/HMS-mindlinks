import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'



export default async function ReceptionistDailyReportListApi (date:Date,token:string){
const url = HMS_Base_Url + "/api/Receptionist/DailyReport"

try{
 const res = await axios.get(url,

   {
    params:{
            date:date.toISOString().split('T')[0]
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