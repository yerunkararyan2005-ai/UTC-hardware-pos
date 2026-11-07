import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Register({ onRegisterSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    shopId: '',
    ownerName: '',
    contact: '',
    address: 'Pune, Maharashtra',
    gstin: '',
    description: 'Hardware POS Shop',
    utcCode: '',
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
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
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert('Please fill username and password!');
      return;
    }
    
    try {
      setLoading(true);

      const userRef = doc(db, 'users', formData.username);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        alert('Username already taken! Please choose another.');
        setLoading(false);
        return;
      }

      // Save Shop Data in Firestore
      await setDoc(doc(db, 'shops', formData.shopId), {
        shopName: formData.shopName,
        shopId: formData.shopId,
        ownerName: formData.ownerName,
        contact: formData.contact,
        address: formData.address,
        gstin: formData.gstin,
        description: formData.description,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Save User Credentials in Firestore
      await setDoc(userRef, {
        username: formData.username,
        password: formData.password,
        shopId: formData.shopId,
        role: 'OWNER',
        createdAt: new Date().toISOString()
      });

      setLoading(false);
      alert('Shop Registered Successfully under UTC Technology Solutions!');
      onRegisterSuccess();

    } catch (err) {
      setLoading(false);
      alert('Firebase Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-[#FFFDF9] border border-[#EBE6DC] shadow-2xl rounded-3xl w-full max-w-4xl p-8 sm:p-12 flex flex-col justify-between">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <img 
              src="https://logowik.com/content/uploads/images/utc-cajamarca9250.logowik.com.webp" 
              alt="UTC Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-sm"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A121F]">Let's get you started</h2>
          <p className="text-sm text-[#736B63] mt-1">Initialize your high-performance UTC Hardware POS lifetime license</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-6 sm:px-24">
          <div className="flex items-center space-x-2.5">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#6B1D2F] text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
            <span className="text-xs sm:text-sm font-bold text-[#4A121F]">Shop Details</span>
          </div>
          <div className={`flex-1 h-1 mx-6 rounded ${step >= 2 ? 'bg-[#6B1D2F]' : 'bg-gray-200'}`}></div>
          <div className="flex items-center space-x-2.5">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#6B1D2F] text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
            <span className="text-xs sm:text-sm font-bold text-[#4A121F]">Credentials</span>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#595048] mb-1.5">UTC Master Agency Code *</label>
              <input 
                type="text" 
                name="utcCode"
                placeholder="ARYANKESARUTCTECHNOLOGYSOLUTIONS.IN" 
                value={formData.utcCode}
                onChange={handleChange}
                required
                className="w-full bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 uppercase font-semibold text-[#2C2621]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#595048] mb-1.5">Shop Name *</label>
                <input type="text" name="shopName" placeholder="Aaijee Hardware" value={formData.shopName} onChange={handleChange} required className="w-full bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#595048] mb-1.5">Owner Name *</label>
                <input type="text" name="ownerName" placeholder="Aryan Yerunkar" value={formData.ownerName} onChange={handleChange} required className="w-full bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#595048] mb-1.5">Contact Number *</label>
              <input type="tel" name="contact" placeholder="9876543210" value={formData.contact} onChange={handleChange} required className="w-full bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621]" />
            </div>
            <button type="submit" className="w-full bg-[#6B1D2F] hover:bg-[#521523] text-white font-extrabold py-3.5 rounded-xl cursor-pointer mt-6 shadow-lg">Continue to Credentials →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#595048] mb-1.5">Username *</label>
                <input type="text" name="username" placeholder="aaijee_admin" value={formData.username} onChange={handleChange} required className="w-full bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621]" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#595048] mb-1.5">Password *</label>
                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full bg-white border border-[#E2D8CC] rounded-xl px-4 py-3 text-[#2C2621]" />
              </div>
            </div>
            <div className="flex space-x-3 pt-6">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl cursor-pointer">← Back</button>
              <button type="submit" disabled={loading} className="w-2/3 bg-[#6B1D2F] hover:bg-[#521523] text-white font-extrabold py-3.5 rounded-xl cursor-pointer shadow-lg">
                {loading ? "Registering on Firebase..." : "Complete Registration"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-10 border-t border-[#F0ECE4] pt-4">
          <p className="text-xs text-[#9E9488]">Powered by UTC Technology Solutions • Secure Enterprise POS License</p>
        </div>
      </div>
    </div>
  );
}