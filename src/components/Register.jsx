import React, { useState } from 'react';

// Dynamic API Base URL configuration for Production (Render) & Local development
const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || 'https://utc-hardware-pos.onrender.com';

export default function Register({ onRegisterSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    shopId: '',
    ownerName: '',
    contact: '',
    email: '',
    address: 'Pune, Maharashtra',
    gstin: '',
    description: 'Hardware POS Shop',
    utcCode: '',
    username: '',
    password: ''
  });

  const [enteredOtp, setEnteredOtp] = useState('');
  const [sentOtp, setSentOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.utcCode.trim().toUpperCase() !== 'ARYANKESARUTCTECHNOLOGYSOLUTIONS.IN') {
        alert('Invalid UTC Master Agency Code! Please enter valid master code.');
        return;
      }
      if (!formData.shopName || !formData.ownerName || !formData.contact) {
        alert('Please fill all required shop details!');
        return;
      }
      const generatedId = formData.shopName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
      setFormData(prev => ({ ...prev, shopId: generatedId }));
      setStep(2);
    } else if (step === 2) {
      if (!formData.email || !formData.username || !formData.password) {
        alert('Please fill email, username, and password!');
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await response.json();
        setLoading(false);

        if (data.success) {
          setSentOtp(data.otp);
          setStep(3);
          alert(`[UTC Secure] Real Email OTP sent successfully to ${formData.email}`);
        } else {
          alert('Failed to send email OTP: ' + data.error);
        }
      } catch (err) {
        setLoading(false);
        alert('Server connection error! Make sure backend server is running.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (parseInt(enteredOtp) === sentOtp) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        setLoading(false);

        if (data.success) {
          alert('Shop Registered Successfully under UTC Technology Solutions!');
          onRegisterSuccess();
        } else {
          alert('Registration Failed: ' + data.error);
        }
      } catch (err) {
        setLoading(false);
        alert('Server connection error! Make sure backend is running.');
      }
    } else {
      alert('Invalid OTP! Please check and try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-[#FFFDF9] border border-[#EBE6DC] shadow-2xl rounded-3xl w-full max-w-4xl p-8 sm:p-12 flex flex-col justify-between transition-all duration-500">
        
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <img 
              src="https://logowik.com/content/uploads/images/utc-cajamarca9250.logowik.com.webp" 
              alt="UTC Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-sm"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A121F] tracking-tight">Let's get you started</h2>
          <p className="text-sm sm:text-base text-[#736B63] mt-1">Initialize your high-performance UTC Hardware POS lifetime license</p>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between mb-8 px-6 sm:px-16">
          <div className="flex items-center space-x-2.5">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-[#6B1D2F] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>1</span>
            <span className="text-xs sm:text-sm font-bold text-[#4A121F]">Shop Details</span>
          </div>
          <div className={`flex-1 h-1 mx-3 rounded transition-all ${step >= 2 ? 'bg-[#6B1D2F]' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-2.5">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-[#6B1D2F] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>2</span>
            <span className="text-xs sm:text-sm font-bold text-[#4A121F]">Credentials</span>
          </div>
          <div className={`flex-1 h-1 mx-3 rounded transition-all ${step >= 3 ? 'bg-[#6B1D2F]' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-2.5">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 3 ? 'bg-[#6B1D2F] text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>3</span>
            <span className="text-xs sm:text-sm font-bold text-[#4A121F]">Verify OTP</span>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleNextStep} autoComplete="off" className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">UTC Master Agency Code *</label>
              <input 
                type="text" 
                name="utcCode"
                autoComplete="off"
                placeholder="ARYANKESARUTCTECHNOLOGYSOLUTIONS.IN" 
                value={formData.utcCode}
                onChange={handleChange}
                required
                className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none font-semibold transition shadow-sm uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Shop Name *</label>
                <input 
                  type="text" 
                  name="shopName"
                  autoComplete="off"
                  placeholder="Aaijee Hardware" 
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Owner Name *</label>
                <input 
                  type="text" 
                  name="ownerName"
                  autoComplete="off"
                  placeholder="Aryan Yerunkar" 
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Contact Number *</label>
              <input 
                type="tel" 
                name="contact"
                autoComplete="off"
                placeholder="9876543210" 
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none transition shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#6B1D2F] hover:bg-[#521523] text-white font-extrabold py-3.5 rounded-xl text-base transition shadow-lg cursor-pointer mt-6"
            >
              Continue to Credentials →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep} autoComplete="off" className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Shop Email (For Real OTP) *</label>
              <input 
                type="email" 
                name="email"
                autoComplete="off"
                placeholder="shop@gmail.com" 
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none transition shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Username *</label>
                <input 
                  type="text" 
                  name="username"
                  autoComplete="off"
                  placeholder="aaijee_admin" 
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Password *</label>
                <input 
                  type="password" 
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full text-sm sm:text-base bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-base transition cursor-pointer"
              >
                ← Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="w-2/3 bg-[#6B1D2F] hover:bg-[#521523] text-white font-extrabold py-3.5 rounded-xl text-base transition shadow-lg cursor-pointer"
              >
                {loading ? "Sending Email OTP..." : "Send Email OTP & Verify"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyOtp} autoComplete="off" className="space-y-6 py-4">
            <div className="bg-white border border-[#E2D8CC] p-4 rounded-xl text-center shadow-sm">
              <p className="text-sm text-[#595048] font-medium">
                We have sent a real 4-digit verification code to your email:<br/><strong className="text-[#4A121F]">{formData.email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-2 text-center">Enter 4-Digit Email OTP</label>
              <input 
                type="text" 
                maxLength="4"
                autoComplete="off"
                placeholder="1234" 
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                required
                className="w-full text-center tracking-[0.75em] text-2xl font-extrabold bg-white border border-[#E2D8CC] rounded-xl px-4 py-4 text-[#4A121F] focus:ring-2 focus:ring-[#6B1D2F] focus:outline-none shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#6B1D2F] hover:bg-[#521523] text-white font-extrabold py-3.5 rounded-xl text-base transition shadow-lg cursor-pointer"
            >
              {loading ? "Registering Shop..." : "Verify & Complete Activation"}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(2)}
              className="w-full text-[#736B63] hover:text-[#4A121F] text-xs font-semibold pt-2 cursor-pointer"
            >
              ← Back to Credentials
            </button>
          </form>
        )}

        <div className="text-center mt-10 border-t border-[#F0ECE4] pt-4">
          <p className="text-xs text-[#9E9488]">Powered by UTC Technology Solutions • Secure Enterprise POS License</p>
        </div>

      </div>
    </div>
  );
}