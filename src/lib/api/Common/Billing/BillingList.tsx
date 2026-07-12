import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { BillingEndpoints } from './BillingEndpoints'



export default async function BillingListApi(date: Date, token: string) {
    const url = HMS_Base_Url + BillingEndpoints.List

    try {
        const res = await axios.get(url,
            {
                params: {
                    date: date.toISOString().split('T')[0]
                },
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