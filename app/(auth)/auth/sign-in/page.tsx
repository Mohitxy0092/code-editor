import SignInFormClient from '@/modules/auth/components/sign-in-form-client'
import Image from 'next/image'
import React from 'react'

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      
      <Image
        src="/login.svg"
        alt="Login-Image"
        width={100}
        height={100}
        className="object-contain"
        priority
      />

      <SignInFormClient />
    </div>
  )
}

export default Page