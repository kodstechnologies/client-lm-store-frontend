

import React, { useState, useRef, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import QRCode from "react-qr-code"
import {
  createOrderForEligible,
  eligibleCheckApi,
  fetchCustomerDetails,
  sendOtpForEligibilityCheck,
  verifyOtpForEligibilityCheck,
} from "../../api"
import { showMessage } from "../common/ShowMessage"

interface FormValues {
  mobileNumber: string
  first_name: string
  last_name: string
  pan: string
  pincode: string
  dob_day: string
  dob_month: string
  dob_year: string
  income: string
}

interface OtpFormValues {
  otp: string[]
}

interface PersistedState {
  step: number
  formValues: FormValues
  phoneVerified: boolean
  eligibilityAmount: number | string | null
  maxAmount: number | string | 0
  eligibilityTenure: number | null
  qrUrl: string
  isEligibleCustomer: boolean
  hasSubmittedOnce: boolean
  customerId: string | null
}

const initialValues: FormValues = {
  mobileNumber: "",
  first_name: "",
  last_name: "",
  pan: "",
  pincode: "",
  dob_day: "",
  dob_month: "",
  dob_year: "",
  income: "",
}

const initialOtpValues: OtpFormValues = {
  otp: Array(6).fill(""),
}

const STORAGE_KEY = "eligibility_form_state"

const EligibilityCheckForm = () => {
  const [step, setStep] = useState(1)
  const [formValues, setFormValues] = useState({
    mobileNumber: "",
    first_name: "",
    last_name: "",
    pan: "",
    pincode: "",
    dob_day: "",
    dob_month: "",
    dob_year: "",
    income: "",
  })

  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [otpSuccess, setOtpSuccess] = useState(false)
  const [eligibilityAmount, setEligibilityAmount] = useState<number | string | null>(null)
  const [maxAmount, setMaxAmount] = useState<number | string>(0)
  const [eligibilityTenure, setEligibilityTenure] = useState<number | null>(null)
  const [qrUrl, setQrUrl] = useState<string>("")
  const [eligibilityError, setEligibilityError] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [isCustomerNotEligible, setIsCustomerNotEligible] = useState(false)
  const [isEligibleCustomer, setIsEligibleCustomer] = useState(false)
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customerDetails, setCustomerDetails] = useState<any>(null)

  // Loading states
  const [isLoadingOtp, setIsLoadingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement>>>(
    Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>()),
  ).current

  // Load persisted state on component mount
  // useEffect(() => {
  //   const savedState = localStorage.getItem(STORAGE_KEY)
  //   if (savedState) {
  //     try {
  //       const parsedState: PersistedState = JSON.parse(savedState)
  //       setStep(parsedState.step)
  //       setFormValues(parsedState.formValues)
  //       setPhoneVerified(parsedState.phoneVerified)
  //       setEligibilityAmount(parsedState.eligibilityAmount)
  //       setMaxAmount(parsedState.maxAmount)
  //       setEligibilityTenure(parsedState.eligibilityTenure)
  //       setQrUrl(parsedState.qrUrl)
  //       setIsEligibleCustomer(parsedState.isEligibleCustomer || false)
  //       setHasSubmittedOnce(parsedState.hasSubmittedOnce || false)
  //       setCustomerId(parsedState.customerId || null)

  //       // If we're on step 4 and have eligibility data, mark as verified
  //       if (parsedState.step === 4 && parsedState.eligibilityAmount) {
  //         setIsOtpVerified(true)
  //         setOtpSuccess(true)
  //       }
  //     } catch (error) {
  //       console.error("Error loading saved state:", error)
  //       localStorage.removeItem(STORAGE_KEY)
  //     }
  //   }
  // }, [])

  // useEffect(() => {
  //   const stateToSave: PersistedState = {
  //     step,
  //     formValues,
  //     phoneVerified,
  //     eligibilityAmount,
  //     maxAmount,
  //     eligibilityTenure,
  //     qrUrl,
  //     isEligibleCustomer,
  //     hasSubmittedOnce,
  //     customerId,
  //   }
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  // }, [
  //   step,
  //   formValues,
  //   phoneVerified,
  //   eligibilityAmount,
  //   maxAmount,
  //   eligibilityTenure,
  //   qrUrl,
  //   isEligibleCustomer,
  //   hasSubmittedOnce,
  //   customerId,
  // ])

  // Clear persisted state and reset all states
  const clearPersistedState = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(1)
    setFormValues(initialValues)
    setPhoneVerified(false)
    setQrUrl("")
    setEligibilityAmount(null)
    setMaxAmount(0)
    setEligibilityTenure(null)
    setOtpError("")
    setOtpSuccess(false)
    setEligibilityError("")
    setIsOtpVerified(false)
    setIsCustomerNotEligible(false)
    setIsEligibleCustomer(false)
    setHasSubmittedOnce(false)
    setCustomerId(null)
  }
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY)

    // Reset all form states if needed
    setStep(1)
    setFormValues(initialValues)
  }, [])

  // Empty dependency array ensures this runs only on mount
  // Reset states when starting new application

  const handleNewApplication = () => {
    clearPersistedState()
    setEligibilityAmount(null)
    setMaxAmount(0)
    setOtpSuccess(false)
    setOtpError("")
  }
  useEffect(() => {
  }, [formValues])

  const phoneValidationSchema = Yup.object({
    mobileNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile number is required"),
  })

  const fullFormValidationSchema = Yup.object({
    mobileNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile number is required"),
    first_name: Yup.string()
      .matches(/^[A-Za-z]+$/, "First name must contain only letters")
      .required("First name is required"),
    last_name: Yup.string()
      .matches(/^[A-Za-z]+$/, "Last name must contain only letters")
      .required("Last name is required"),
    pan: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format (e.g., ABCDE1234F)")
      .required("PAN is required"),
    pincode: Yup.string()
      .matches(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
      .required("Pincode is required"),
    dob_day: Yup.string().required("Day is required"),
    dob_month: Yup.string().required("Month is required"),
    dob_year: Yup.string()
      .matches(/^[0-9]{4}$/, "Year must be 4 digits")
      .required("Year is required")
      .test("valid-date", "Invalid date of birth", function (value) {
        const { dob_day, dob_month } = this.parent
        if (!dob_day || !dob_month || !value) return true

        const dob = `${value}-${dob_month.padStart(2, "0")}-${dob_day.padStart(2, "0")}`
        const dobDate = new Date(dob)
        const today = new Date()

        return !isNaN(dobDate.getTime()) && dobDate <= today
      }),
    income: Yup.number()
      .typeError("Income must be a number")
      .min(12000, "Income must be at least ₹12,000")
      .required("Income is required"),
  })

  const handlePhoneSubmit = async (values: FormValues) => {
    setIsLoadingOtp(true)
    // Reset states when starting new phone verification
    setOtpError("")
    setOtpSuccess(false)
    setEligibilityAmount(null)
    setMaxAmount(0)
    setIsOtpVerified(false)
    setIsCustomerNotEligible(false)
    setIsEligibleCustomer(false)

    try {
      setFormValues({
        ...formValues,
        mobileNumber: values.mobileNumber,
      })

      const otpSent = await sendOtpForEligibilityCheck({ mobileNumber: values.mobileNumber })
      if (otpSent) {
        setStep(2)
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      setOtpError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoadingOtp(false)
    }
  }

  const handleOtpSubmit = async (values: OtpFormValues) => {
    const otpString = values.otp.join("")

    setIsVerifyingOtp(true)
    setOtpError("")
    setOtpSuccess(false)

    try {
      const res = await verifyOtpForEligibilityCheck({
        mobileNumber: formValues.mobileNumber,
        otp: otpString,
      })
      console.log("🚀 ~ handleOtpSubmit ~ res:", res)
      // Check if QR is generated and eligibility date is NOT expired
      if (
        res?.Order?.status === "QR Generated" &&
        res?.Order?.eligibility_expiry_date &&
        new Date(res.Order.eligibility_expiry_date) > new Date() // not expired
      ) {
        // Show QR
        setQrUrl(res.Order.qrUrl)
        setStep(4)
      } else {
        // Eligibility expired or QR not generated  Show prefilled form
        try {
          const customerIdToUse = res.Order?.customerId || res.customerId
          console.log("🚀 ~ handleOtpSubmit ~ customerIdToUse:", customerIdToUse)

          if (customerIdToUse) {
            const customerDetailsResponse = await fetchCustomerDetails(customerIdToUse)
            console.log("🚀 ~ handleOtpSubmit ~ customerDetailsResponse:", customerDetailsResponse)

            let customer = customerDetailsResponse?.data?.data || customerDetailsResponse?.data || customerDetailsResponse

            if (Array.isArray(customer)) {
              customer = customer[0]
            }

            if (customer && typeof customer === "object") {
              const dob = new Date(customer.dob || customer.dateOfBirth || customer.date_of_birth || "")
              const day = dob.getDate().toString().padStart(2, "0")
              const month = (dob.getMonth() + 1).toString().padStart(2, "0")
              const year = dob.getFullYear().toString()

              const updatedFormValues = {
                mobileNumber: customer.mobileNumber || "",
                first_name: customer.first_name || "",
                last_name: customer.last_name || "",
                pan: customer.pan || "",
                pincode: customer.pincode || "",
                dob_day: day,
                dob_month: month,
                dob_year: year,
                income: customer.income || "",
              }

              setFormValues(updatedFormValues)
              setStep(3)
            } else {
              setTimeout(() => setStep(3), 1500)
            }
          } else {
            setTimeout(() => setStep(3), 1500)
          }
        } catch (error) {
          console.error("Error fetching customer details after OTP:", error)
          setTimeout(() => setStep(3), 1500)
        }
      }

      if (res.success) {
        setOtpSuccess(true)
        setPhoneVerified(true)
        setIsOtpVerified(true)

        // CASE 1: Eligible - New Customer or not completed before

        if (res.max_eligibility_amount) {
          setEligibilityAmount(res.max_eligibility_amount)
          setEligibilityTenure(res.tenure || 12)
          setIsEligibleCustomer(true)
          setCustomerId(res.customerId || res.Order?.customerId)

          // Generate QR code for eligible customer
          setIsGeneratingQR(true)
          try {
            const customerIdForOrder = res.customerId || res.Order?.customerId
            if (customerIdForOrder) {
              const order = await createOrderForEligible({ customerId: customerIdForOrder })
              if (order?.data?.order?.qrUrl) {
                setQrUrl(order.data.order.qrUrl)
              }
            }
          } catch (error) {
            console.error("Error creating order for eligible customer:", error)
          } finally {
            setIsGeneratingQR(false)
          }

          // CASE 2: Already has a completed order — Returning customer
        } else if (res.Order?.status === "QR Generated") {
          // console.log("🚀 Returning customer with completed order");
          setIsEligibleCustomer(true)
          setEligibilityAmount(res.Order.eligibleAmount || 3000)
          setMaxAmount(10000)
          setEligibilityTenure(res.Order.tenure || 12)
          setCustomerId(res.Order.customerId)

          if (res.Order.qrUrl) {
            setQrUrl(res.Order.qrUrl)
          } else {
            console.warn("❌ No QR URL in completed order")

            setIsGeneratingQR(false) // Do this AFTER qrUrl is set
          }
        } else {
          // console.log("ORDER STSTUS", res.Order?.status);

          setTimeout(() => {
            setStep(3)
          }, 1500)
        }
      } else {
        if (res.message === "Customer not eligible") {
          setStep(3)
        } else if (res.message === "Eligibility expired") {
          setOtpError(res.message)
          setTimeout(() => {
            setStep(3)
          }, 1500)
        }
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || "Something went wrong during OTP verification."
      console.error("OTP verification failed:", errMsg)
      setOtpError(errMsg)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleFinalSubmit = async (values: FormValues) => {
    setIsCheckingEligibility(true)

    const finalValues = {
      ...values,
      dob: `${values.dob_year}-${values.dob_month.padStart(2, "0")}-${values.dob_day.padStart(2, "0")}`,
    }

    // Update form values to persist the data
    setFormValues(values)
    setEligibilityError("")

    try {
      const response = await eligibleCheckApi(finalValues)
      console.log("🚀 ~ handleFinalSubmit ~ response:", response)
      const responseCustomerId = response.data.data._id
      const eligibilityData = response.data.data
      console.log("🚀 ~ handleFinalSubmit ~ eligibilityData:", eligibilityData)
      if (response.data.success) {
        setCustomerId(responseCustomerId)
        // Set values from response if present
        if (eligibilityData.data?.max_amount) {
          // console.log("🚀 ~ handleFinalSubmit ~ eligibilityData.data?.max_amount:", eligibilityData.data?.max_amount)
          setMaxAmount(Number(eligibilityData.data.max_amount) || 10000)
        }
        if (eligibilityData.max_eligibility_amount) {
          setEligibilityAmount(Number(eligibilityData.max_eligibility_amount))
        }
        if (eligibilityData.tenure) {
          setEligibilityTenure(eligibilityData.tenure)
        }

        // Handle non-eligible customers with specific message
        // if (eligibilityData.eligibility_status === false) {
        if (eligibilityData.message === "User already exists in the system.") {
          // Proceed without setting error
          setMaxAmount(10000)
          setEligibilityAmount(3000)
          setEligibilityTenure(30)
        }
        //  else {
        //   setEligibilityError(eligibilityData.message || "Not eligible.")
        //   return
        // }
        // }

        // Create order irrespective of eligibility (handled in backend)
        const order = await createOrderForEligible({ customerId: responseCustomerId })
        if (order?.data?.order?.qrUrl) {
          setQrUrl(order.data.order.qrUrl)
        }

        // Mark as submitted once and move to step 4
        setHasSubmittedOnce(true)
        setStep(4)
      } else {
        const eligibilityData = response.data

        if (eligibilityData.message) {
          setEligibilityError(eligibilityData.message)
        }
      }
    } catch (error: any) {
      console.error("Eligibility API error:", error)

      const errorMessage = error?.response?.data?.message || error?.message

      if (errorMessage?.includes("PAN already exists") || errorMessage?.includes("PAN already in use")) {
        setEligibilityError("This PAN card is already registered with another account.")
      } else if (errorMessage?.includes("not eligible")) {
        setEligibilityError("You are not eligible for a loan at this time.")
      } else {
        setEligibilityError(error?.response?.data?.message)
      }
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResendingOtp(true)
    // Clear previous states when resending
    setOtpError("")
    setOtpSuccess(false)
    setEligibilityAmount(null)
    setMaxAmount(0)
    setIsCustomerNotEligible(false)
    setIsEligibleCustomer(false)

    try {
      await sendOtpForEligibilityCheck({ mobileNumber: formValues.mobileNumber })
      showMessage("OTP Sent Successfully")
    } catch (error) {
      console.error("Error resending OTP:", error)
      // alert("Failed to resend OTP. Please try again.")
    } finally {
      setIsResendingOtp(false)
    }
  }

  // Full screen loader for step 3
  if (isCheckingEligibility) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800">
            {hasSubmittedOnce ? "Updating Your Information" : "Checking Your Eligibility"}
          </h3>
          <p className="text-gray-600">Please wait while we process your information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center m-1 mb-2">
      <div className="w-full max-w-full sm:max-w-md">
        <div className=" rounded p-1 sm:p-4 mx-1 sm:mx-0">
          <h4 className="text-lg font-bold text-center">
            {step === 1 && ""}
            {step === 2 && (isEligibleCustomer ? "QR Generated" : "Verify OTP")}
            {step === 3 && ""}
            {step === 4 && "QR Generated"}
          </h4>

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <Formik
              initialValues={{
                mobileNumber: formValues.mobileNumber,
                first_name: "",
                last_name: "",
                pan: "",
                pincode: "",
                dob_day: "",
                dob_month: "",
                dob_year: "",
                income: "",
              }}
              enableReinitialize={true}
              validationSchema={phoneValidationSchema}
              onSubmit={handlePhoneSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-2">
                  <div>
                    <h4 className="text-xl font-bold text-center">Enter Mobile Number</h4>
                    {/* <label className="block text-sm font-medium mb-1">Mobile Number</label> */}
                    <br />
                    <Field name="mobileNumber">
                      {({ field, form }: any) => (
                        <input
                          {...field}
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Enter 10 digit mobile number"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "")
                            if (val.length <= 10) {
                              form.setFieldValue("mobileNumber", val)
                            }
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="mobileNumber" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoadingOtp}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full gap-2 flex items-center justify-center"
                  >
                    {isLoadingOtp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Step 2: OTP Verification or QR Display for Eligible Customers */}
          {step === 2 && (
            <div>
              {/* Show OTP form only if customer is not eligible yet */}
              {!isEligibleCustomer && (
                <Formik initialValues={initialOtpValues} onSubmit={handleOtpSubmit}>
                  {({ values, setFieldValue }) => {
                    return (
                      <Form className="space-y-3">
                        <p className="text-center mb-2 text-[16px]">
                          We have sent a verification code to{" "}
                          <span className="font-semibold">{formValues.mobileNumber}</span>
                        </p>
                        <div>
                          <label className="block text-[16px] font-medium mb-1 ">Enter 6-digit OTP</label>
                          <br />
                          <div className="flex justify-center gap-[8px] sm:gap-[8px] md:gap-[18px]">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <input
                                key={index}
                                ref={inputRefs[index]}
                                maxLength={1}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                disabled={isVerifyingOtp || isOtpVerified}
                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                value={values.otp[index] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "")
                                  if (val.length <= 1) {
                                    const newOtp = [...values.otp]
                                    newOtp[index] = val
                                    setFieldValue("otp", newOtp)
                                    if (val && index < 5) {
                                      inputRefs[index + 1].current?.focus()
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace" && !values.otp[index] && index > 0) {
                                    inputRefs[index - 1].current?.focus()
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault()
                                  const pastedData = e.clipboardData
                                    .getData("text/plain")
                                    .replace(/\D/g, "")
                                    .slice(0, 6)
                                  if (pastedData) {
                                    const newOtp = Array(6).fill("")
                                    for (let i = 0; i < pastedData.length; i++) {
                                      newOtp[i] = pastedData[i]
                                    }
                                    setFieldValue("otp", newOtp)
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {otpError && !isCustomerNotEligible && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded flex items-center text-sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>{otpError}</span>
                          </div>
                        )}

                        {isCustomerNotEligible && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded flex items-center text-sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Customer not eligible</span>
                          </div>
                        )}

                        {otpSuccess && !isEligibleCustomer && (
                          <div className="bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded flex items-center text-sm">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>OTP verified successfully!</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleNewApplication}
                            disabled={isVerifyingOtp}
                            className="px-3 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                          </button>

                          <button
                            type="submit"
                            disabled={
                              values.otp.join("").length !== 6 ||
                              isVerifyingOtp ||
                              isOtpVerified ||
                              isCustomerNotEligible
                            }
                            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full gap-2 flex items-center justify-center text-sm"
                          >
                            {isVerifyingOtp ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify OTP"
                            )}
                          </button>
                        </div>

                        <p className="text-center text-sm text-gray-500">
                          Didn't receive the code?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              handleResendOtp()
                              setFieldValue("otp", ["", "", "", "", "", ""])
                              inputRefs[0]?.current?.focus()
                            }}
                            disabled={isResendingOtp || isOtpVerified}
                            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          >
                            {isResendingOtp ? "Resending..." : "Resend OTP"}
                          </button>
                        </p>
                      </Form>
                    )
                  }}
                </Formik>
              )}

              {/* Show congratulations and QR for eligible customers */}
              {isEligibleCustomer && (
                <div className="space-y-3">
                  {eligibilityAmount && (
                    <div className=" p-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-center">
                      <div className="space-y-1">
                        <p className="text-gray-700 text-sm">
                          You are eligible for a loan ranging from <br></br>{" "}
                          {maxAmount || eligibilityAmount ? (
                            <>
                              <span className="font-semibold text-blue-600 ">
                                ₹{eligibilityAmount.toLocaleString()}
                              </span>
                              {" to "}
                              <span className="font-semibold text-blue-600">₹{maxAmount.toLocaleString()}</span>
                            </>
                          ) : (
                            <>
                              {" "}
                              <span className="font-semibold text-blue-600">
                                ₹{eligibilityAmount?.toLocaleString()}
                              </span>
                              {" to "}
                              <span className="font-semibold text-blue-600">{maxAmount}</span>
                            </>
                          )}
                        </p>
                        {eligibilityTenure && (
                          <div className="text-left">
                            <ul className="list-disc pl-5 text-xs">
                              <li>
                                Loan Tenure: <span className="font-semibold text-green-600">30 days</span>
                              </li>
                              <li>Interest Rate: 8%</li>
                              <li>Processing Fees: 3%</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isGeneratingQR ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Generating your QR code...</p>
                    </div>
                  ) : qrUrl ? (
                    <div className="text-center space-y-2">
                      <p className="text-gray-600 text-sm">
                        Scan the QR code below to proceed with your loan application
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                          <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                            <QRCode value={qrUrl} size={120} />
                          </a>
                        </div>
                        <p className="text-xs text-gray-500">Click on QR code to open the application</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex justify-center items-center">
                    <button
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full gap-2 flex items-center justify-center text-sm"
                      onClick={handleNewApplication}
                    >
                      Start New Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Complete Profile */}
          {step === 3 && (
            <div className="space-y-3">
              {/* {console.log("🚀 ~ Step 3 formValues:", formValues)} */}
              <Formik
                initialValues={{
                  mobileNumber: formValues.mobileNumber || "",
                  first_name: formValues.first_name || "",
                  last_name: formValues.last_name || "",
                  pan: formValues.pan || "",
                  pincode: formValues.pincode || "",
                  dob_day: formValues.dob_day || "",
                  dob_month: formValues.dob_month || "",
                  dob_year: formValues.dob_year || "",
                  income: formValues.income || "",
                }}
                validationSchema={fullFormValidationSchema}
                onSubmit={handleFinalSubmit}
                enableReinitialize={true}
              >
                {({ values, setFieldValue }) => (
                  <Form className="space-y-2">
                    {/* Mobile Number (Non-editable) */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1 ">Mobile Number</label>
                      <div className="flex items-center">
                        <input
                          value={formValues.mobileNumber}
                          readOnly
                          disabled
                          className="w-full p-1.5 border border-gray-300 rounded bg-gray-50 text-gray-700 text-[16px]"
                        />
                        <div className="ml-2 text-blue-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    {/* First Name */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1">First Name(As per PAN)</label>
                      <Field name="first_name">
                        {({ field, form }: any) => (
                          <input
                            {...field}
                            className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^A-Za-z]/g, "")
                              form.setFieldValue("first_name", val)
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1">Last Name(As per PAN)</label>
                      <Field name="last_name">
                        {({ field, form }: any) => (
                          <input
                            {...field}
                            className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^A-Za-z]/g, "")
                              form.setFieldValue("last_name", val)
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* PAN Card */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1">PAN Card</label>
                      <Field name="pan">
                        {({ field, form }: any) => (
                          <input
                            {...field}
                            maxLength={10}
                            className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-[16px]"
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                              form.setFieldValue("pan", val)
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="pan" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1">Pincode</label>
                      <Field name="pincode">
                        {({ field, form }: any) => (
                          <input
                            {...field}
                            maxLength={6}
                            inputMode="numeric"
                            className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "")
                              form.setFieldValue("pincode", val)
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1">Date of Birth</label>
                      <div className="flex gap-1">
                        <Field
                          as="select"
                          name="dob_day"
                          className="flex-1 p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                        >
                          <option value="">Day</option>
                          {[...Array(31)].map((_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {i + 1}
                            </option>
                          ))}
                        </Field>

                        <Field
                          as="select"
                          name="dob_month"
                          className="flex-1 p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                        >
                          <option value="">Month</option>
                          {[
                            { value: "01", label: "January" },
                            { value: "02", label: "February" },
                            { value: "03", label: "March" },
                            { value: "04", label: "April" },
                            { value: "05", label: "May" },
                            { value: "06", label: "June" },
                            { value: "07", label: "July" },
                            { value: "08", label: "August" },
                            { value: "09", label: "September" },
                            { value: "10", label: "October" },
                            { value: "11", label: "November" },
                            { value: "12", label: "December" },
                          ].map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </Field>

                        <div className="flex-1">
                          <Field name="dob_year">
                            {({ field, form }: any) => (
                              <input
                                {...field}
                                type="text"
                                maxLength={4}
                                placeholder="Year"
                                className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "")
                                  form.setFieldValue("dob_year", val)
                                }}
                              />
                            )}
                          </Field>
                        </div>
                      </div>
                      <div className="flex flex-col mt-1">
                        <ErrorMessage name="dob_day" component="div" className="text-red-500 text-sm" />
                        <ErrorMessage name="dob_month" component="div" className="text-red-500 text-sm" />
                        <ErrorMessage name="dob_year" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>

                    {/* Monthly Income */}
                    <div>
                      <label className="block text-[16px] font-medium mb-1">Monthly Income (₹)</label>
                      <Field name="income">
                        {({ field, form }: any) => (
                          <input
                            {...field}
                            className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[16px]"
                            inputMode="numeric"
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "")
                              form.setFieldValue("income", val)
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="income" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Error Message Display */}
                    {eligibilityError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded flex items-center text-[16px]">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{eligibilityError}</span>
                      </div>
                    )}
                    {/* <div className="flex gap-2"> */}

                    <button
                      type="submit"
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full gap-2 flex items-center justify-center text-sm"
                    >
                      {hasSubmittedOnce ? "Update Information" : "Check Eligibility"}
                    </button>
                    <button
                      className="px-3 py-2 bg-white text-back rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full gap-2 flex items-center justify-center text-sm border-gray-500 border"
                      onClick={handleNewApplication}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </button>
                    {/* </div> */}
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Step 4: QR Code Display */}
          {step === 4 && (
            <div className="text-center space-y-3">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Scan the QR code below to proceed with your loan application</p>

                {/* Enhanced Eligibility Information Display */}
                {eligibilityAmount && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-center">
                    <div className="space-y-1">
                      <p className="text-gray-700 text-sm">
                        You are eligible for a loan ranging from <br></br>{" "}
                        {maxAmount && eligibilityAmount ? (
                          <>
                            <span className="font-semibold text-blue-600">₹{eligibilityAmount.toLocaleString()}</span>
                            {" to "}
                            <span className="font-semibold text-blue-600">₹{maxAmount}</span>
                          </>
                        ) : (
                          <>
                            {" "}
                            <span className="font-semibold text-blue-600">₹{eligibilityAmount?.toLocaleString()}</span>
                          </>
                        )}
                      </p>
                      {eligibilityTenure && (
                        <div className="text-left">
                          <ul className="list-disc pl-5 text-xs">
                            <li>
                              Loan Tenure: <span className="font-semibold text-green-600">30 days</span>
                            </li>
                            <li>Interest Rate: 8%</li>
                            <li>Processing Fees: 3%</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {qrUrl && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                      <div className="p-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                        <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                          <QRCode value={qrUrl} size={120} />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500">Click on QR code to open the application</p>
                    </div>
                  )}

                  <button
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full gap-2 flex items-center justify-center text-sm"
                    onClick={handleNewApplication}
                  >
                    Start New Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EligibilityCheckForm
