import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { setPageTitle } from '../store/themeConfigSlice';
import { setUser } from '../store/userConfigSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showMessage } from '../components/common/ShowMessage';
import IconPhoneCall from '../components/Icon/IconPhoneCall';
import Logo from '../assets/logo/logo.png'
import { mobileVerify, verifyOtp } from '../api';

interface FormValues {
    contactNo: string;
    otp0: string;
    otp1: string;
    otp2: string;
    otp3: string;
    otp4: string;
    otp5: string;
}

const Login = () => {
    // const [agree, setAgree] = useState(false);

    const [hide, setHide] = useState(true);
    const [timer, setTimer] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    function hidefunction() {
        setHide(false);
    }

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setPageTitle('Merchant Login'));
    }, [dispatch]);

    const [countdown, setCountdown] = useState(0);

    const inputRefs = useRef<HTMLInputElement[]>([]);
    const handleSendOtp = async () => {
        try {
            //  Basic mobile number validation
            if (!formik.values.contactNo || formik.values.contactNo.length !== 10) {
                showMessage('Please enter a valid 10-digit mobile number', 'error');
                return;
            }

            showMessage('Sending OTP...');

            //  Call the API with correct format
            const response = await mobileVerify({ mobileNumber: formik.values.contactNo });

            if (response?.success) {
                showMessage('OTP sent successfully');
                setOtpSent(true);
                setTimer(60);
                setCountdown(30);
                hidefunction(); // Navigate to OTP screen
            } else {
                showMessage(response?.message || 'Failed to send OTP', 'error');
            }
        } catch (error: any) {
            console.error('Error sending OTP:', error);

            if (error.response) {
                const { status, data } = error.response;

                switch (status) {
                    case 404:
                        showMessage('Mobile number not registered as a Store', 'error'); // ✅ changed from Store or Merchant
                        break;
                    case 400:
                        showMessage(data.message || 'Invalid mobile number format', 'error');
                        break;
                    case 500:
                        showMessage('Server error. Please try again later.', 'error');
                        break;
                    default:
                        showMessage(data.message || 'Failed to send OTP', 'error');
                }
            } else if (error.request) {
                showMessage('Network error. Please check your connection.', 'error');
            } else {
                showMessage('Something went wrong. Please try again.', 'error');
            }

            setOtpSent(false);
            setCountdown(0);
            setTimer(0);
        }

    };

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev: number) => prev - 1);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        // Ensure only numeric values are entered
        if (/^\d*$/.test(value) && value.length <= 1) {
            formik.handleChange(e);
            if (e.target.value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const key = `otp${index}` as keyof FormValues;
        if (e.key === 'Backspace' && !formik.values[key] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const loginSchema = Yup.object().shape({
        contactNo: Yup.string()
            .required('Contact number is required')
            .matches(/^\d{10}$/, 'Contact number must be exactly 10 digits'),
        otp0: Yup.string().required('Required').length(1, 'Must be 1 character'),
        otp1: Yup.string().required('Required').length(1, 'Must be 1 character'),
        otp2: Yup.string().required('Required').length(1, 'Must be 1 character'),
        otp3: Yup.string().required('Required').length(1, 'Must be 1 character'),
        otp4: Yup.string().required('Required').length(1, 'Must be 1 character'),
        otp5: Yup.string().required('Required').length(1, 'Must be 1 character'),
    });

    const handleLogin = async (values: FormValues) => {
        const otp = `${values.otp0}${values.otp1}${values.otp2}${values.otp3}${values.otp4}${values.otp5}`;

        try {

            const response = await verifyOtp({ mobileNumber: values.contactNo, otp });

            // console.log("🚀 ~ handleLogin ~ response:", response)
            if (response?.success === true) {
                dispatch(setUser({
                    auth: true,
                    userType: 'merchant',
                    userData: {
                        ...response,
                    },
                }));
                localStorage.setItem('storeName', response.storeName);
                localStorage.setItem('storeEmail', response.storeEmail);
                localStorage.setItem('storeMerchantName', response.storeMerchantName)
                const storecode = localStorage.setItem('storeCode', response.StoreCode)
                // console.log("🚀 ~ handleLogin ~ storecode:", storecode)
                const phone = localStorage.setItem('storePhone', response.storePhone)
                // console.log("🚀 ~ handleLogin ~ phone:", phone)

                // showMessage('Logged in successfully');
                navigate('/merchant/dashboard');
            }
            else {
                showMessage('OTP verification failed', 'error');
            }

        } catch (error: any) {
            const errorData = error?.response?.data;
            // console.log("🚀 ~ handleLogin ~ errorData:", errorData)

            // if (errorData?.isActive === false) {
            //     showMessage('Store is disabled from login', 'error');
            // } else {
            showMessage(errorData?.message || 'OTP verification failed', 'error');
            // }
            console.error('OTP Verification Error:', error);
        }
    };


    const formik = useFormik<FormValues>({
        initialValues: {
            contactNo: '',
            otp0: '',
            otp1: '',
            otp2: '',
            otp3: '',
            otp4: '',
            otp5: '',
        },
        validationSchema: loginSchema,
        enableReinitialize: true,
        onSubmit: handleLogin,

    });

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="background" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="object1" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="object2" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="object3" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="polygon" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[600px] py-20">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="w-36 h-36">
                                <img src={Logo || "/placeholder.svg"} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="mb-6">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Login</h1>

                            </div>

                            <form className="space-y-5 dark:text-white" onSubmit={formik.handleSubmit}>
                                {hide ? (
                                    <div>
                                        <label htmlFor="contactNo">Contact Number</label>
                                        <div className="relative">
                                            <input
                                                id="contactNo"
                                                name="contactNo"
                                                type="text"
                                                placeholder="Enter contact number"
                                                value={formik.values.contactNo}
                                                onChange={(e) => {
                                                    const { value } = e.target;
                                                    if (/^\d*$/.test(value) && value.length <= 10) {
                                                        formik.handleChange(e);
                                                    }
                                                }}
                                                onBlur={formik.handleBlur}
                                                maxLength={10}
                                                style={{ fontSize: '20px', width: '100%', paddingRight: '' }}
                                                className="form-input ps-10 placeholder:text-white-dark"
                                            />

                                            <span className="absolute start-4 top-1/3   -translate-y-1/2 pb-16">
                                                <IconPhoneCall fill={true} />
                                            </span>
                                            <div className="flex items-start mt-4">

                                                <label htmlFor="agree" className="text-sm text-gray-700">
                                                    By clicking <strong>Continue</strong>, you agree to our{' '}
                                                    <a href="https://littlemoney.co.in/privacy-policy" target="_blank" className="text-blue-600 underline">
                                                        Privacy Policy
                                                    </a>{' '}
                                                    and{' '}
                                                    <a href="https://littlemoney.co.in/terms-use" target="_blank" className="text-blue-600 underline">
                                                        Terms & Conditions
                                                    </a>.
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={isSendingOtp || countdown > 0}
                                                onClick={async () => {
                                                    if (formik.values.contactNo.match(/^\d{10}$/)) {
                                                        setIsSendingOtp(true);
                                                        try {
                                                            await handleSendOtp(); // Await OTP send logic
                                                        } catch (err) {
                                                            console.error('OTP send failed', err);
                                                        } finally {
                                                            setIsSendingOtp(false);
                                                        }
                                                    } else {
                                                        formik.setTouched({ contactNo: true });
                                                    }
                                                }}
                                                className={`w-full mt-5 p-3 rounded-md border border-transparent transition 
    ${countdown > 0 || isSendingOtp
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700 cursor-pointer'} text-white shadow`}
                                            >
                                                {isSendingOtp ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Sending OTP...</span>
                                                    </span>
                                                ) : (
                                                    countdown > 0 ? `Resend OTP in ${countdown}s` : 'Continue'
                                                )}
                                            </button>


                                        </div>

                                        {formik.touched.contactNo && formik.errors.contactNo && <div className="text-danger">{formik.errors.contactNo}</div>}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full max-w-md mx-auto px-4">
                                            <label htmlFor="otp" className="block mb-2 font-medium">
                                                Enter OTP sent on {formik.values.contactNo
                                                    ? `XXXXXX${formik.values.contactNo.slice(-4)}`
                                                    : ''}

                                            </label>

                                            <div className="flex justify-between gap-2">
                                                {[0, 1, 2, 3, 4, 5].map((index) => {
                                                    const key = `otp${index}` as keyof FormValues;
                                                    return (
                                                        // <input
                                                        //     key={index}
                                                        //     id={`otp${index}`}
                                                        //     name={`otp${index}`}
                                                        //     type="password"
                                                        //     ref={(el: HTMLInputElement | null) => {
                                                        //         if (el) inputRefs.current[index] = el;
                                                        //     }}
                                                        //     value={formik.values[key]}
                                                        //     onChange={(e) => handleChange(e, index)}
                                                        //     onKeyDown={(e) => handleKeyDown(e, index)}
                                                        //     maxLength={1}
                                                        //     className="border rounded text-center text-lg p-2 w-9 sm:w-10"
                                                        // />
                                                        <input
                                                            key={index}
                                                            id={`otp${index}`}
                                                            name={`otp${index}`}
                                                            type="password"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            ref={(el: HTMLInputElement | null) => {
                                                                if (el) inputRefs.current[index] = el;
                                                            }}
                                                            value={formik.values[key]}
                                                            onChange={(e) => handleChange(e, index)}
                                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                                            maxLength={1}
                                                            className="border rounded text-center text-lg p-2 w-9 sm:w-10"
                                                        />


                                                    );
                                                })}
                                            </div>

                                            {(formik.touched.otp0 || formik.touched.otp1 || formik.touched.otp2 || formik.touched.otp3 || formik.touched.otp4 || formik.touched.otp5) &&
                                                (formik.errors.otp0 || formik.errors.otp1 || formik.errors.otp2 || formik.errors.otp3 || formik.errors.otp4 || formik.errors.otp5) && (
                                                    <div className="text-danger mt-2 text-sm">
                                                        {
                                                            (formik.errors.otp0 ||
                                                                formik.errors.otp1 ||
                                                                formik.errors.otp2 ||
                                                                formik.errors.otp3 ||
                                                                formik.errors.otp4 ||
                                                                formik.errors.otp5) as string
                                                        }
                                                    </div>
                                                )}
                                        </div>


                                        <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                            Verify OTP and Login
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpSent && timer > 0}
                                            className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                        >
                                            {otpSent && timer > 0 ? `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}` : 'Resend OTP'}
                                        </button>

                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;