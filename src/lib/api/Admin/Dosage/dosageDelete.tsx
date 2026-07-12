import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { dosageEndpoints } from './dosageEndpoints'



export default async function dosageDeleteApi(id: number, token: string) {
    const url = HMS_Base_Url + dosageEndpoints.Delete + id

    try {
        const res = await axios.post(url, {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                    Authorization: `Bearer ${token}`

                }
            })
        return res.data
    }
    catch (error) {
        ErrorHandles(error);
        throw error
    }

}