'use client'

import React from 'react'
import Script from 'next/script'
import { initiate } from '../../../actions/useractions'

const P2Page = ({ r_id, r_srt }) => {
  const pay = async (amount) => {
    try {
      const order = await initiate(amount, r_id, r_srt)
      const options = {
        key: r_id,                       
        amount: order.amount,            
        currency: 'INR',
        name: 'Acme Corp',
        description: 'Test Transaction',
        image: 'https://example.com/your_logo',
        order_id: order.id,            
        callback_url: 'https://eneqd3r9zrjok.x.pipedream.net/',
        prefill: {
          name: 'Gaurav Kumar',
          email: 'gaurav.kumar@example.com',
          contact: '9000090000',
        },
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      }

      // 3) Open the Razorpay checkout modal
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Razorpay initiation error:', err)
    }
  }

  return (
    <div>
      {/* Load Razorpay checkout.js */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <button
        onClick={() => pay(5000)}
        className="p-2 bg-blue-600 text-white rounded"
      >
        Pay ₹50
      </button>
    </div>
  )
}

export default P2Page
