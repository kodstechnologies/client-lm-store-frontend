
import axios from 'axios'
const VITE_BACKEND_LOCALHOST_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const api = axios.create({
    baseURL: VITE_BACKEND_LOCALHOST_API_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

export const mobileVerify = async (payload: any) => {
    try {
        const res = await api.post('/mobile-verification', payload)
        return res.data;
    } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
}

export const verifyOtp = async (payload: any) => {
    try {
        const res = await api.post('/otp-verify', payload);

        const token = res.data?.token;

        if (token) {
            localStorage.setItem('authToken', token);
        }

        return res.data;
    } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
}


export const sendOtpForEligibilityCheck = async (payload: any) => {
    try {
        const token = localStorage.getItem("authToken");

        const res = await api.post('/send-otp-eligibility-check', payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        // console.log("🚀 ~ sendOtpForEligibilityCheck ~ res:", res)
        return res;
    } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
}
export const verifyOtpForEligibilityCheck = async (payload: any) => {
    try {
        const token = localStorage.getItem("authToken");

        const res = await api.post(
            '/otp-verify-eligible-check',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        // console.log("🚀 ~ verifyOtpForEligibilityCheck ~ res:", res);
        return res.data;
    } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
};

export const eligibleCheckApi = async (payload: any) => {
    try {
        const token = localStorage.getItem("authToken");
        const res = await api.post('/check-customer-eligibility', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // console.log("🚀 ~ eligibleCheckApi ~ res.data:", res.data)
        return res;
    } catch (error) {
        console.error("Eligibility check error:", error);
        throw error;
    }
};

export const fetchCustomerDetails = async (id: any) => {
    // console.log("🚀 ~ fetchCustomerDetails ~ id:", id)
    const token = localStorage.getItem("authToken");
    // const res=await api.post('/',payload,{})
    try {
        const res = await api.get(`get-customer-details/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        // console.log("🚀 ~ fetchCustomerDetails ~ res:", res)
        return res
    } catch (error) {
        console.error("error:", error);
        throw error;
    }
}

//Create QR

export const createOrderForEligible = async (payload: any) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await api.post('/create-order', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response;
    } catch (error) {
        console.error("error:", error);
        throw error;
    }
}

// export const fetchAllOrders = async () => {
//     try {
//         const token = localStorage.getItem("authToken");

//         const res = await api.get('/all-orders', {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         })
//         return res;
//     } catch (error) {
//         console.error("error:", error);
//         throw error;
//     }
// }


export const fetchOrdersByStore = async () => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Authentication token not found");
        }

        const res = await api.get('/orders-by-store', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // console.log("🚀 ~ fetchOrdersByStore ~ res:", res)
        // console.log("res fro orders by id", res);

        return res.data; // optional: you can return just the data
    } catch (error) {
        console.error("Error fetching orders by store:", error);
        throw error;
    }
};

export const updateOrderById = async (orderId: string) => {
    try {
        const token = localStorage.getItem("authToken");
        // console.log("🚀 ~ updateOrderById ~ token:", token);

        const res = await api.put(
            `/update-order-by-id/${orderId}`,
            { status: "Completed" }, // This is the request body
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return res;
    } catch (error) {
        console.error("error:", error);
        throw error;
    }
};


export const searchOrderByPhoneNumber = async (phoneNumber: any) => {
    try {
        const token = localStorage.getItem("authToken");

        const res = await api.get('/search-by-number', {
            params: { number: phoneNumber }, // include query param
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data;
    } catch (error: any) {
        console.error("Search error:", error);
        throw error.response?.data?.message || 'Something went wrong';
    }
};

export const filterByDate = async (startDate: string, endDate: string) => {
    try {
        const token = localStorage.getItem("authToken");
        const res = await api.get(`/get-orders-by-date?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        return res;
    } catch (error: any) {
        console.error("Error filtering orders by date:", error.message);
        return null;
    }
}
export const getStatusCounts = async () => {
    try {
        const token = localStorage.getItem("authToken");
        const res = await api.get('/status-counts', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        // console.log("🚀 ~ getStatusCounts ~ res:", res.data)
        return res.data;
    } catch (error: any) {
        console.error(" error:", error);
        throw error.response?.data?.message || 'Something went wrong';
    }
}
//dashboard stats
export const stats = async () => {
    try {
        const token = localStorage.getItem("authToken");

        const res = await api.get('/monthly-stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        // console.log("🚀 ~ stats ~ res:", res.data)
        return res;
    } catch (error: any) {
        console.error(" error:", error);
        throw error.response?.data?.message || 'Something went wrong';
    }
}