import React, { useState, useEffect } from 'react';

// Dynamic API Base URL configuration for Production (Render) & Local development
// Direct Production API URL for Render
const API_BASE_URL = 'https://utc-hardware-pos.onrender.com';
export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('utc_current_view') || 'register';
  });

  const [isLocked, setIsLocked] = useState(false);
  const [mpin, setMpin] = useState(() => localStorage.getItem('utc_mpin') || '1234');
  const [enteredMpin, setEnteredMpin] = useState('');
  const [newMpinInput, setNewMpinInput] = useState('');

  const [regData, setRegData] = useState(() => {
    const saved = localStorage.getItem('utc_reg_data');
    return saved ? JSON.parse(saved) : {
      shopName: '',
      shopEmail: '',
      shopId: '',
      ownerName: '',
      contactNumber: '',
      username: '',
      password: '',
      address: 'Pune, Maharashtra',
      gstin: '',
      description: 'Hardware POS Shop',
      utcCode: ''
    };
  });

  const [step, setStep] = useState(1);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [sentOtp, setSentOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setupMpinInput, setSetupMpinInput] = useState('');
  const [showAgencyCode, setShowAgencyCode] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('billing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('utc_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Categories: Agar products nahi hain toh categories bhi bilkul empty honi chahiye
  const [categories, setCategories] = useState(() => {
    const savedProds = localStorage.getItem('utc_products');
    const prods = savedProds ? JSON.parse(savedProds) : [];
    if (prods.length === 0) {
      return []; // Agar naya shop hai ya products zero hain, toh categories bhi 0 hongi
    }
    const saved = localStorage.getItem('utc_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [newProd, setNewProd] = useState({ name: '', category: '', price: '', stock: '', unit: 'Pcs', image: '' });
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '' });

  const [cart, setCart] = useState([]);
  const [customerMode, setCustomerMode] = useState("walkin");
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [cartError, setCartError] = useState('');
  
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isGstDropdownOpen, setIsGstDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('utc_settings');
    return saved ? JSON.parse(saved) : { gstPercent: 0, barcodeScannerEnabled: false, stockCheckEnabled: true };
  });

  const [billGstPercent, setBillGstPercent] = useState(0);

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('utc_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [showOutOfStockList, setShowOutOfStockList] = useState(false);
  const [showAvailableList, setShowAvailableList] = useState(false);
  const [showBillsList, setShowBillsList] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showCreditList, setShowCreditList] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => { localStorage.setItem('utc_current_view', currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem('utc_reg_data', JSON.stringify(regData)); }, [regData]);
  useEffect(() => { localStorage.setItem('utc_mpin', mpin); }, [mpin]);
  useEffect(() => { localStorage.setItem('utc_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('utc_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('utc_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('utc_invoices', JSON.stringify(invoices)); }, [invoices]);

  useEffect(() => {
    setBillGstPercent(settings.gstPercent);
  }, [settings.gstPercent]);

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleShopDetailsSubmit = (e) => {
    e.preventDefault();
    if (regData.utcCode.trim().toUpperCase() !== 'ARYANKESARUTCTECHNOLOGYSOLUTIONS.IN') {
      alert('Invalid UTC Master Agency Code! Please enter valid master code.');
      return;
    }
    setStep(2);
  };

  const handleOwnerDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!regData.shopEmail || !regData.username || !regData.password) {
      alert('Please fill email, username, and password!');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regData.shopEmail })
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setSentOtp(data.otp);
        setStep(3);
        alert(`[UTC Secure] Real Email OTP sent successfully to ${regData.shopEmail}`);
      } else {
        alert('Failed to send email OTP: ' + data.error);
      }
    } catch (err) {
      setLoading(false);
      alert('Server connection error! Make sure backend server is running.');
    }
  };

  const handleVerifyOtpAndMpin = async (e) => {
    e.preventDefault();
    if (parseInt(enteredOtp) !== sentOtp) {
      alert('Invalid OTP!');
      return;
    }
    if (!setupMpinInput || setupMpinInput.length !== 4) {
      alert('Please enter a 4-digit MPIN.');
      return;
    }
    setMpin(setupMpinInput);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setProducts([]);
        setInvoices([]);
        setCategories([]);
        localStorage.removeItem('utc_products');
        localStorage.removeItem('utc_invoices');
        localStorage.removeItem('utc_categories');
        alert('Shop Registered Successfully under UTC Technology Solutions!');
        setCurrentView('login');
      } else {
        alert('Registration Failed: ' + data.error);
      }
    } catch (err) {
      setLoading(false);
      alert('Server connection error! Make sure backend is running.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setRegData({
          ...regData,
          shopName: data.shop.shopName,
          shopEmail: data.shop.email,
          shopId: data.shop.shopId,
          ownerName: data.shop.ownerName,
          contactNumber: data.shop.contact,
          address: data.shop.address,
          gstin: data.shop.gstin,
          description: data.shop.description
        });
        localStorage.setItem('utc_token', data.token);
        
        if (products.length === 0) {
          setCategories([]);
          localStorage.removeItem('utc_categories');
        }

        setCurrentView('dashboard');
        setIsLocked(false);
        setLoginForm({ username: '', password: '' });
      } else {
        alert(data.message || 'Invalid Username or Password!');
      }
    } catch (err) {
      setLoading(false);
      alert('Server connection error during login!');
    }
  };

  const handleFullLogout = () => {
    if (confirm("Kya aap sach me fully logout karna chahte hain?")) {
      setCurrentView('login');
      setIsLocked(false);
      localStorage.setItem('utc_current_view', 'login');
    }
  };

  const handleAddNewProduct = (e) => {
    e.preventDefault();
    let finalCat = newProd.category;
    if (finalCat === 'add_new' || !finalCat) {
      if (!customCategoryInput.trim()) {
        alert("Please select or enter a valid category name!");
        return;
      }
      finalCat = customCategoryInput.trim();
      if (!categories.includes(finalCat)) {
        setCategories([...categories, finalCat]);
      }
    }

    if (!newProd.name || !newProd.price || (settings.stockCheckEnabled && !newProd.stock)) {
      alert("Please fill all mandatory fields!");
      return;
    }

    const productObj = {
      id: Date.now(),
      name: newProd.name,
      category: finalCat,
      price: parseFloat(newProd.price),
      stock: settings.stockCheckEnabled ? parseInt(newProd.stock, 10) : 9999,
      unit: newProd.unit || 'Pcs',
      image: newProd.image || ''
    };

    setProducts([...products, productObj]);
    setNewProd({ name: '', category: '', price: '', stock: '', unit: 'Pcs', image: '' });
    setCustomCategoryInput('');
    alert("Product added successfully!");
    setActiveTab('billing');
  };

  const handleDeleteProduct = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveEditProduct = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: editForm.name.trim() !== '' ? editForm.name : p.name,
          price: !isNaN(parseFloat(editForm.price)) ? parseFloat(editForm.price) : p.price,
          stock: !isNaN(parseInt(editForm.stock, 10)) ? parseInt(editForm.stock, 10) : p.stock
        };
      }
      return p;
    }));
    setEditingProductId(null);
  };

  const addToCart = (product) => {
    setCartError('');
    if (settings.stockCheckEnabled && product.stock <= 0) {
      setCartError(`Product "${product.name}" is Out of Stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (settings.stockCheckEnabled && existing.qty >= product.stock) {
          setCartError(`Stock limit reached! Only ${product.stock} available.`);
          return prev;
        }
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, val) => {
    setCartError('');
    if (val === '') {
      setCart(cart.map(item => item.id === id ? { ...item, qty: '' } : item));
      return;
    }
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty <= 0) return;

    const prod = products.find(p => p.id === id);
    if (settings.stockCheckEnabled && prod && qty > prod.stock) {
      setCartError(`Available stock only ${prod.stock} for ${prod.name}!`);
      return;
    }

    setCart(cart.map(item => item.id === id ? { ...item, qty } : item));
  };

  const updateCartPrice = (id, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;
    setCart(cart.map(item => item.id === id ? { ...item, price } : item));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * (parseInt(item.qty) || 0), 0);
  const taxAmount = (subtotal * billGstPercent) / 100;
  const grandTotal = subtotal + taxAmount;

  const triggerPrintReceipt = (inv) => {
    const cgst = (inv.tax / 2).toFixed(2);
    const sgst = (inv.tax / 2).toFixed(2);

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${inv.billNumber}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px; margin: 0; padding: 10px; color: #000; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .line { border-bottom: 1px dashed #000; margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; font-size: 11px; }
              th, td { text-align: left; padding: 2px; }
              th { border-bottom: 1px solid #000; }
              .right { text-align: right; }
            </style>
          </head>
          <body>
            <div class="center bold" style="font-size: 14px;">${regData.shopName.toUpperCase()}</div>
            <div class="center">${regData.address}</div>
            <div class="center">Contact: ${regData.contactNumber}</div>
            <div class="center">GSTIN: ${regData.gstin}</div>
            <div class="line"></div>
            <div class="center" style="font-size: 10px;">${regData.description}</div>
            <div class="line"></div>
            <div><b>Bill No:</b> #${inv.billNumber} (${inv.id})</div>
            <div><b>Date:</b> ${inv.date}</div>
            <div><b>Customer:</b> ${inv.customer} (${inv.phone})</div>
            <div><b>Mode:</b> ${inv.mode}</div>
            <div class="line"></div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th class="right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items.map(i => `
                  <tr>
                    <td>${i.name}</td>
                    <td>${i.qty}</td>
                    <td>₹${i.price}</td>
                    <td class="right">₹${i.price * i.qty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="line"></div>
            <div><b>Subtotal:</b> ₹${inv.subtotal.toFixed(2)}</div>
            ${inv.gstPercent > 0 ? `
              <div><b>CGST (${inv.gstPercent/2}\%):</b> ₹${cgst}</div>
              <div><b>SGST (${inv.gstPercent/2}\%):</b> ₹${sgst}</div>
            ` : ''}
            <div style="font-size: 13px;" class="bold">GRAND TOTAL: ₹${inv.total.toFixed(2)}</div>
            <div class="line"></div>
            <div class="center bold">Thank You! Visit Again</div>
            <div class="center" style="font-size: 9px;">Powered by UTC Technology Solutions</div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleGenerateInvoice = (paymentMode) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (customerMode === "credit") {
      if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
        alert("Please enter Customer Name and Contact Number for On Credit billing!");
        return;
      }
    }

    const nextBillNo = invoices.length + 1;
    const invoiceNo = `UTC-INV-${nextBillNo.toString().padStart(4, '0')}`;
    const newInvoice = {
      id: invoiceNo,
      billNumber: nextBillNo,
      date: new Date().toLocaleString(),
      customer: customerMode === 'credit' ? customerInfo.name : 'Walk-in Customer',
      phone: customerMode === 'credit' ? customerInfo.phone : 'N/A',
      items: [...cart],
      subtotal,
      gstPercent: billGstPercent,
      tax: taxAmount,
      total: grandTotal,
      mode: paymentMode
    };

    if (settings.stockCheckEnabled) {
      const updatedProds = products.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - (parseInt(cartItem.qty, 10) || 0)) };
        }
        return p;
      });
      setProducts(updatedProds);
    }

    setInvoices([newInvoice, ...invoices]);
    triggerPrintReceipt(newInvoice);

    alert(`Bill #${nextBillNo} generated & saved successfully!`);
    setCart([]);
    setCustomerInfo({ name: '', phone: '' });
  };

  const handleDeleteInvoice = (id) => {
    if (confirm("Are you sure you want to delete this bill from history?")) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const filteredProducts = selectedCategory === "All" ? products : products.filter(p => p.category === selectedCategory);

  const filteredInvoices = invoices.filter(inv => {
    if (!dateRange.from || !dateRange.to) return true;
    const invDate = new Date(inv.date);
    return invDate >= new Date(dateRange.from) && invDate <= new Date(dateRange.to + 'T23:59:59');
  });

  if (currentView === 'register') {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#FFFDF9] border border-[#EBE6DC] shadow-2xl rounded-3xl w-full max-w-xl p-6 sm:p-10">
          <div className="text-center mb-6">
            <img src="https://logowik.com/content/uploads/images/utc-cajamarca9250.logowik.com.webp" alt="Logo" className="w-20 h-20 mx-auto object-contain mb-2" />
            <h2 className="text-2xl font-extrabold text-[#4A121F]">UTC POS Registration</h2>
            <p className="text-xs text-[#736B63] mt-1">Enterprise Hardware Billing Software</p>
          </div>

          {step === 1 && (
            <form onSubmit={handleShopDetailsSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#595048] mb-1">UTC Master Agency Code *</label>
                <div className="relative">
                  <input 
                    type={showAgencyCode ? "text" : "password"} 
                    name="utcCode" 
                    autoComplete="off" 
                    placeholder="ENTER ADMIN ACCESS CODE" 
                    value={regData.utcCode} 
                    onChange={handleRegChange} 
                    required 
                    className="w-full text-sm border rounded-xl p-3 pr-16 bg-white uppercase font-bold text-[#4A121F]" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowAgencyCode(!showAgencyCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 cursor-pointer bg-gray-100 px-2.5 py-1 rounded-lg"
                  >
                    {showAgencyCode ? "Hide 🙈" : "Show 👁️"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#595048] mb-1">Shop Name *</label>
                  <input type="text" name="shopName" autoComplete="off" placeholder="ENTER SHOP NAME" value={regData.shopName} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#595048] mb-1">Shop ID (6-Digit) *</label>
                  <input type="text" name="shopId" autoComplete="off" placeholder="ENTER SHOP ID" value={regData.shopId} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#595048] mb-1">Shop Email (For Real OTP) *</label>
                <input type="email" name="shopEmail" autoComplete="off" placeholder="ENTER SHOP EMAIL I'D" value={regData.shopEmail} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
              </div>
              <button type="submit" className="w-full bg-[#6B1D2F] text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer mt-2">Continue to Credentials & Owner →</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOwnerDetailsSubmit} autoComplete="off" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#595048] mb-1">Owner Name *</label>
                  <input type="text" name="ownerName" autoComplete="off" placeholder="ENTER OWNER NAME" value={regData.ownerName} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#595048] mb-1">Contact Number *</label>
                  <input type="tel" name="contactNumber" autoComplete="off" placeholder="ENTER OWNER CONTACT" value={regData.contactNumber} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#595048] mb-1">Login Username *</label>
                  <input type="text" name="username" autoComplete="off" placeholder="admin" value={regData.username} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#595048] mb-1">Login Password *</label>
                  <input type="password" name="password" autoComplete="new-password" placeholder="••••••••" value={regData.password} onChange={handleRegChange} required className="w-full text-sm border rounded-xl p-3 bg-white" />
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">← Back</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-[#6B1D2F] text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer">{loading ? "Sending Real OTP..." : "Send Real Email OTP"}</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyOtpAndMpin} autoComplete="off" className="space-y-4">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border text-center">
                <p className="text-xs text-[#595048]">We have sent a real 4-digit code to your email:<br/><strong className="text-[#4A121F]">{regData.shopEmail}</strong></p>
              </div>
              <input type="text" maxLength="4" autoComplete="off" placeholder="1234" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} required className="w-full text-center tracking-[0.5em] text-xl font-extrabold border rounded-xl p-3 bg-white" />
              <div>
                <label className="block text-xs font-bold text-[#595048] mb-1">Setup 4-Digit MPIN (For Sleep/Lock) *</label>
                <input type="password" maxLength="4" autoComplete="off" placeholder="••••" value={setupMpinInput} onChange={(e) => setSetupMpinInput(e.target.value)} required className="w-full text-center tracking-[0.5em] text-xl font-extrabold border rounded-xl p-3 bg-white" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#6B1D2F] text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer">{loading ? "Registering Shop..." : "Verify & Complete Registration"}</button>
            </form>
          )}

          <div className="text-center mt-6 border-t pt-4">
            <p className="text-xs text-[#736B63]">Already registered? <button onClick={() => setCurrentView('login')} className="text-[#6B1D2F] font-bold underline cursor-pointer">Login with Username & Password</button></p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen w-full bg-[#FAF7F2] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#FFFDF9] border border-[#EBE6DC] shadow-2xl rounded-3xl w-full max-w-sm p-8">
          <div className="text-center mb-6">
            <img src="https://logowik.com/content/uploads/images/utc-cajamarca9250.logowik.com.webp" alt="Logo" className="w-16 h-16 mx-auto mb-3 object-contain" />
            <h2 className="text-xl font-extrabold text-[#4A121F]">{regData.shopName || 'UTC POS'}</h2>
            <p className="text-xs text-[#736B63] mt-1">Enter your login credentials</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
              <input type="text" autoComplete="off" placeholder="admin" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} required className="w-full text-sm border rounded-xl p-3 bg-white font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input type="password" autoComplete="new-password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} required className="w-full text-sm border rounded-xl p-3 bg-white font-medium" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#6B1D2F] text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer">{loading ? "Logging in..." : "Login to Dashboard"}</button>
          </form>

          <div className="text-center mt-6 border-t pt-4">
            <button onClick={() => setCurrentView('register')} className="text-xs text-[#6B1D2F] font-bold underline cursor-pointer">Register New Shop</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-screen flex flex-col overflow-hidden font-sans relative">
      <header className="bg-[#4A121F] text-white px-4 py-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 rounded-lg hover:bg-[#5a1727] lg:hidden text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <img src="https://logowik.com/content/uploads/images/utc-cajamarca9250.logowik.com.webp" alt="Logo" className="w-8 h-8 object-contain bg-white rounded-full p-0.5" />
          <h1 className="text-sm sm:text-base font-bold truncate max-w-[180px] sm:max-w-none">{regData.shopName}</h1>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5">
          <button onClick={() => setActiveTab('billing')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'billing' ? 'bg-[#8C6D53] text-white' : 'text-gray-200 hover:bg-[#5a1727]'}`}>🛒 Billing Counter</button>
          <button onClick={() => setActiveTab('products')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'products' ? 'bg-[#8C6D53] text-white' : 'text-gray-200 hover:bg-[#5a1727]'}`}>📦 Add Product</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'inventory' ? 'bg-[#8C6D53] text-white' : 'text-gray-200 hover:bg-[#5a1727]'}`}>📋 Inventory List</button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#8C6D53] text-white' : 'text-gray-200 hover:bg-[#5a1727]'}`}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('settings')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'settings' ? 'bg-[#8C6D53] text-white' : 'text-gray-200 hover:bg-[#5a1727]'}`}>⚙️ Profile & Settings</button>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setIsLocked(true)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium cursor-pointer">🔒 Sleep</button>
          <button onClick={handleFullLogout} className="bg-red-700 hover:bg-red-800 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium cursor-pointer">🚪 Logout</button>
        </div>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-72 bg-[#FFFDF9] h-full shadow-2xl flex flex-col z-10 p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <img src="https://logowik.com/content/uploads/images/utc-cajamarca9250.logowik.com.webp" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-extrabold text-[#4A121F] text-sm">{regData.shopName}</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <div className="flex flex-col space-y-2 text-xs font-bold">
              <button onClick={() => { setActiveTab('billing'); setIsSidebarOpen(false); }} className={`p-3 rounded-xl text-left cursor-pointer ${activeTab === 'billing' ? 'bg-[#6B1D2F] text-white' : 'bg-gray-50 text-gray-800'}`}>🛒 Billing Counter</button>
              <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`p-3 rounded-xl text-left cursor-pointer ${activeTab === 'products' ? 'bg-[#6B1D2F] text-white' : 'bg-gray-50 text-gray-800'}`}>📦 Add Product</button>
              <button onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} className={`p-3 rounded-xl text-left cursor-pointer ${activeTab === 'inventory' ? 'bg-[#6B1D2F] text-white' : 'bg-gray-50 text-gray-800'}`}>📋 Inventory List & Edit</button>
              <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`p-3 rounded-xl text-left cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#6B1D2F] text-white' : 'bg-gray-50 text-gray-800'}`}>📊 Dashboard & Udhar Ledger</button>
              <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`p-3 rounded-xl text-left cursor-pointer ${activeTab === 'settings' ? 'bg-[#6B1D2F] text-white' : 'bg-gray-50 text-gray-800'}`}>⚙️ Profile & Settings</button>
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-[#4A121F] mb-1">Counter Locked (Sleep Mode)</h3>
            <p className="text-xs text-gray-500 mb-4">Enter 4-digit MPIN to unlock</p>
            <form onSubmit={(e) => { e.preventDefault(); if(enteredMpin === mpin) { setIsLocked(false); setEnteredMpin(''); } else { alert('Incorrect MPIN!'); } }}>
              <input type="password" maxLength="4" placeholder="••••" value={enteredMpin} onChange={(e) => setEnteredMpin(e.target.value)} required className="w-full text-center tracking-[0.5em] text-2xl border rounded-xl p-2.5 mb-3 bg-gray-50 font-bold" />
              <button type="submit" className="w-full bg-[#6B1D2F] text-white py-2.5 rounded-xl font-bold text-sm shadow cursor-pointer">Unlock Counter</button>
            </form>
          </div>
        </div>
      )}

      {/* BILLING COUNTER */}
      {activeTab === 'billing' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto">
            <div className="mb-3">
              <input type="text" placeholder={settings.barcodeScannerEnabled ? "Barcode Scanner Active..." : "Search items by name..."} className="w-full px-3 py-2.5 text-sm border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[#6B1D2F]" />
            </div>

            <div className="flex flex-wrap gap-2 pb-2 mb-3">
              <button onClick={() => setSelectedCategory("All")} className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer ${selectedCategory === "All" ? "bg-[#4A121F] text-white shadow" : "bg-white border text-gray-700"}`}>All Items</button>
              {categories.map((cat, idx) => (
                <button key={idx} onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer ${selectedCategory === cat ? "bg-[#4A121F] text-white shadow" : "bg-white border text-gray-700"}`}>{cat}</button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 mt-4">
                <p className="text-gray-500 font-bold text-sm mb-1">No products found in this shop!</p>
                <p className="text-gray-400 text-xs mb-3">Go to "Add Product" tab to add your shop inventory.</p>
                <button onClick={() => setActiveTab('products')} className="bg-[#6B1D2F] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">➕ Add First Product</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between">
                    <div>
                      {product.image && <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-2" />}
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded uppercase font-bold">{product.category}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 mt-1 truncate">{product.name}</h3>
                      <p className="text-[11px] text-gray-500">{settings.stockCheckEnabled ? `Stock: ${product.stock} ${product.unit}` : 'Stock: Available'}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs sm:text-sm font-extrabold text-[#4A121F]">₹{product.price}</span>
                      <span className="bg-[#F4EFEB] text-[#4A121F] text-[10px] px-2.5 py-1 rounded-lg font-extrabold">+Add</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shadow-lg">
            <div className="p-3.5 border-b bg-gray-50 flex justify-between items-center relative">
              <h2 className="text-sm font-bold text-gray-800">Current Cart ({cart.length})</h2>
              
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                  className="text-xs border rounded-lg px-2.5 py-1.5 bg-white font-medium cursor-pointer flex items-center space-x-1 shadow-sm"
                >
                  <span>{customerMode === 'walkin' ? 'Walk-in Customer' : 'On Credit (Udhar)'}</span>
                  <span className="text-[10px]">▼</span>
                </button>
                {isCustomerDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs font-medium">
                    <button type="button" onClick={() => { setCustomerMode('walkin'); setIsCustomerDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">Walk-in Customer</button>
                    <button type="button" onClick={() => { setCustomerMode('credit'); setIsCustomerDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">On Credit (Udhar)</button>
                  </div>
                )}
              </div>
            </div>

            {customerMode === 'credit' && (
              <div className="p-2.5 border-b bg-amber-50 space-y-1.5">
                <input type="text" placeholder="Customer Name *" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full text-xs border rounded-lg p-1.5 bg-white font-bold" />
                <input type="tel" placeholder="Mobile Number *" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full text-xs border rounded-lg p-1.5 bg-white font-bold" />
              </div>
            )}

            {cartError && (
              <div className="bg-red-100 text-red-700 text-xs px-3 py-2 font-bold border-b border-red-200">
                ⚠️ {cartError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-10 font-medium">Cart is empty. Tap any product.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[11px] text-gray-500">₹</span>
                        <input type="number" value={item.price} onChange={(e) => updateCartPrice(item.id, e.target.value)} className="w-14 text-xs border rounded px-1 py-0.5 bg-white font-bold" />
                        <span className="text-[11px] text-gray-500">Qty:</span>
                        <input type="number" value={item.qty} onChange={(e) => updateCartQty(item.id, e.target.value)} className="w-12 text-xs border rounded px-1 py-0.5 bg-white font-bold" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="font-extrabold text-[#4A121F]">₹{(parseFloat(item.price)||0) * (parseInt(item.qty)||0)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold cursor-pointer">Remove 🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 border-t bg-gray-50 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              
              <div className="flex justify-between text-gray-600 items-center relative">
                <span>Bill GST (%)</span>
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setIsGstDropdownOpen(!isGstDropdownOpen)}
                    className="border rounded-lg px-2.5 py-1 bg-white font-bold text-xs cursor-pointer flex items-center space-x-1 shadow-sm"
                  >
                    <span>{billGstPercent === 0 ? '0% (No GST)' : `${billGstPercent}% (CGST + SGST)`}</span>
                    <span className="text-[10px]">▼</span>
                  </button>
                  {isGstDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs font-medium">
                      <button type="button" onClick={() => { setBillGstPercent(0); setIsGstDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">0% (No GST)</button>
                      <button type="button" onClick={() => { setBillGstPercent(5); setIsGstDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">5% (CGST 2.5% + SGST 2.5%)</button>
                      <button type="button" onClick={() => { setBillGstPercent(12); setIsGstDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">12% (CGST 6% + SGST 6%)</button>
                      <button type="button" onClick={() => { setBillGstPercent(18); setIsGstDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">18% (CGST 9% + SGST 9%)</button>
                      <button type="button" onClick={() => { setBillGstPercent(28); setIsGstDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">28% (CGST 14% + SGST 14%)</button>
                    </div>
                  )}
                </div>
              </div>

              {billGstPercent > 0 && (
                <div className="text-[11px] text-gray-500 flex justify-between bg-white px-2 py-1 rounded border">
                  <span>CGST: ₹{(taxAmount/2).toFixed(2)}</span>
                  <span>SGST: ₹{(taxAmount/2).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-extrabold text-gray-900 border-t pt-1.5"><span>Grand Total</span><span className="text-[#4A121F]">₹{grandTotal.toFixed(2)}</span></div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button onClick={() => handleGenerateInvoice('Cash')} className="bg-[#4A121F] text-white py-2 rounded-xl font-bold text-xs shadow cursor-pointer">Cash</button>
                <button onClick={() => handleGenerateInvoice('UPI')} className="bg-gray-200 text-gray-800 py-2 rounded-xl font-bold text-xs hover:bg-gray-300 cursor-pointer">UPI</button>
                <button onClick={() => handleGenerateInvoice('Card')} className="bg-gray-200 text-gray-800 py-2 rounded-xl font-bold text-xs hover:bg-gray-300 cursor-pointer">Card</button>
                <button onClick={() => handleGenerateInvoice('Credit')} className="bg-[#8C6D53] text-white py-2 rounded-xl font-bold text-xs shadow cursor-pointer">Credit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT */}
      {activeTab === 'products' && (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF7F2]">
          <h2 className="text-xl font-extrabold text-[#4A121F] mb-4">Add New Hardware Product</h2>
          <form onSubmit={handleAddNewProduct} className="bg-white p-6 rounded-2xl border shadow-sm max-w-xl space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
              <input type="text" placeholder="e.g. PVC Elbow 1-inch" value={newProd.name} onChange={(e) => setNewProd({...newProd, name: e.target.value})} required className="w-full border rounded-xl p-3 bg-gray-50 font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block font-bold text-gray-700 mb-1">Category *</label>
                <button 
                  type="button" 
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full text-left border rounded-xl p-3 bg-gray-50 font-medium cursor-pointer flex justify-between items-center"
                >
                  <span>{newProd.category || '-- Select Category --'}</span>
                  <span>▼</span>
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs font-medium max-h-40 overflow-y-auto">
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-gray-400 text-xs">No categories yet. Add custom below!</div>
                    ) : (
                      categories.map((c, i) => (
                        <button key={i} type="button" onClick={() => { setNewProd({...newProd, category: c}); setIsCategoryDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">{c}</button>
                      ))
                    )}
                    <button type="button" onClick={() => { setNewProd({...newProd, category: 'add_new'}); setIsCategoryDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 font-bold text-[#6B1D2F]">+ Add Custom Category</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit</label>
                <input type="text" value={newProd.unit} onChange={(e) => setNewProd({...newProd, unit: e.target.value})} placeholder="Pcs / Roll / Kg" className="w-full border rounded-xl p-3 bg-gray-50 font-medium" />
              </div>
            </div>

            {(newProd.category === 'add_new' || categories.length === 0) && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">New Category Name *</label>
                <input type="text" placeholder="e.g. Screws, Washers" value={customCategoryInput} onChange={(e) => setCustomCategoryInput(e.target.value)} className="w-full border rounded-xl p-3 bg-gray-50 font-medium" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                <input type="number" placeholder="150" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: e.target.value})} required className="w-full border rounded-xl p-3 bg-gray-50 font-medium" />
              </div>
              {settings.stockCheckEnabled && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Opening Stock Quantity *</label>
                  <input type="number" placeholder="50" value={newProd.stock} onChange={(e) => setNewProd({...newProd, stock: e.target.value})} required className="w-full border rounded-xl p-3 bg-gray-50 font-medium" />
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Image (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setNewProd({...newProd, image: reader.result});
                  reader.readAsDataURL(file);
                }
              }} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium text-xs cursor-pointer" />
            </div>

            <button type="submit" className="w-full bg-[#6B1D2F] text-white py-3.5 rounded-xl font-extrabold text-sm shadow cursor-pointer">Save & Add Product to Inventory</button>
          </form>
        </div>
      )}

      {/* INVENTORY LIST */}
      {activeTab === 'inventory' && (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF7F2]">
          <h2 className="text-xl font-extrabold text-[#4A121F] mb-4">Complete Inventory List & Stock Management</h2>
          <div className="bg-white rounded-2xl border p-4 sm:p-6 shadow-sm overflow-x-auto">
            {products.length === 0 ? (
              <p className="text-gray-400 text-xs py-8 text-center font-medium">No products added yet. Go to "Add Product" to create your inventory.</p>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-100 uppercase text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price (₹)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => {
                    const isEditing = editingProductId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                              className="w-full border rounded px-2 py-1 font-bold text-gray-800 bg-white" 
                            />
                          ) : (
                            <span className="font-bold text-gray-800">{p.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold text-xs">{p.category}</span>
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editForm.price} 
                              onChange={(e) => setEditForm({...editForm, price: e.target.value})} 
                              className="w-20 border rounded px-2 py-1 font-extrabold text-[#4A121F] bg-white" 
                            />
                          ) : (
                            <span className="font-extrabold text-[#4A121F]">₹{p.price}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editForm.stock} 
                              onChange={(e) => setEditForm({...editForm, stock: e.target.value})} 
                              className="w-16 border rounded px-2 py-1 font-bold bg-white" 
                            />
                          ) : (
                            <span className="font-bold">{p.stock} {p.unit}</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1 sm:space-x-2">
                          {isEditing ? (
                            <button onClick={() => handleSaveEditProduct(p.id)} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer">Save ✅</button>
                          ) : (
                            <button onClick={() => { setEditingProductId(p.id); setEditForm({ name: p.name, price: p.price, stock: p.stock }); }} className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer">Edit ✏️</button>
                          )}
                          <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer">Delete 🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF7F2]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#4A121F]">Store Sales & Udhar Ledger Dashboard</h2>
              <p className="text-xs text-gray-500">Live performance overview for {regData.shopName}</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-white border p-2 rounded-xl text-xs shadow-sm">
              <span>From:</span>
              <input type="date" value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} className="border rounded p-1" />
              <span>To:</span>
              <input type="date" value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} className="border rounded p-1" />
              {dateRange.from && <button onClick={() => setDateRange({from:'', to:''})} className="text-red-600 font-bold px-1 cursor-pointer">Clear</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-[#4A121F] mt-1">₹{filteredInvoices.reduce((a, b) => a + b.total, 0).toFixed(2)}</h3>
              <div className="text-[11px] text-gray-500 mt-2 space-x-2">
                <span>Cash: ₹{filteredInvoices.filter(i=>i.mode==='Cash').reduce((a,b)=>a+b.total,0)}</span>
                <span>Online: ₹{filteredInvoices.filter(i=>i.mode==='UPI'||i.mode==='Card').reduce((a,b)=>a+b.total,0)}</span>
              </div>
            </div>

            <div onClick={() => setShowCreditList(!showCreditList)} className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:border-amber-700 transition">
              <p className="text-xs text-gray-500 font-bold uppercase">Credit / Udhar Pending (Click)</p>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-1">₹{filteredInvoices.filter(i => i.mode === 'Credit').reduce((a, b) => a + b.total, 0).toFixed(2)}</h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold mt-2 inline-block">{showCreditList ? 'Hide Udhar List ▲' : 'View Customers ▼'}</span>
            </div>

            <div onClick={() => setShowProductsList(!showProductsList)} className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:border-[#6B1D2F] transition">
              <p className="text-xs text-gray-500 font-bold uppercase">Total Products (Click)</p>
              <h3 className="text-2xl font-extrabold text-[#4A121F] mt-1">{products.length} Items</h3>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold mt-2 inline-block">{showProductsList ? 'Hide List ▲' : 'Show List ▼'}</span>
            </div>

            <div onClick={() => setShowBillsList(!showBillsList)} className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:border-[#6B1D2F] transition">
              <p className="text-xs text-gray-500 font-bold uppercase">Total Bills (Click)</p>
              <h3 className="text-2xl font-extrabold text-[#4A121F] mt-1">{filteredInvoices.length}</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold mt-2 inline-block">{showBillsList ? 'Hide Invoices ▲' : 'Show Invoices ▼'}</span>
            </div>

            {settings.stockCheckEnabled && (
              <>
                <div onClick={() => setShowAvailableList(!showAvailableList)} className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:border-emerald-700 transition">
                  <p className="text-xs text-gray-500 font-bold uppercase">Available In-Stock (Click)</p>
                  <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{products.filter(p => p.stock > 0).length} Items</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold mt-2 inline-block">{showAvailableList ? 'Hide Stock ▲' : 'View Stock ▼'}</span>
                </div>

                <div onClick={() => setShowOutOfStockList(!showOutOfStockList)} className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:border-red-700 transition">
                  <p className="text-xs text-gray-500 font-bold uppercase">Out of Stock Alerts (Click)</p>
                  <h3 className="text-2xl font-extrabold text-red-700 mt-1">{products.filter(p => p.stock <= 0).length} Items</h3>
                  <span className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded font-bold mt-2 inline-block">{showOutOfStockList ? 'Hide Alerts ▲' : 'View Alerts ▼'}</span>
                </div>
              </>
            )}
          </div>

          {showCreditList && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-amber-900 mb-3">📋 Pending Credit (Udhar) Customers Ledger</h3>
              {filteredInvoices.filter(i => i.mode === 'Credit').length === 0 ? (
                <p className="text-xs text-gray-600">No pending credit bills!</p>
              ) : (
                <div className="space-y-2">
                  {filteredInvoices.filter(i => i.mode === 'Credit').map((inv, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-gray-900">{inv.customer} <span className="text-gray-500 font-normal">({inv.phone})</span></p>
                        <p className="text-[11px] text-gray-500">Bill: {inv.id} | Date: {inv.date}</p>
                      </div>
                      <span className="font-extrabold text-amber-700 text-sm">₹{inv.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showAvailableList && settings.stockCheckEnabled && (
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-900 mb-2">🟢 In-Stock Products</h3>
              {products.filter(p => p.stock > 0).length === 0 ? <p className="text-xs text-gray-600">No products in stock!</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {products.filter(p => p.stock > 0).map(p => (
                    <div key={p.id} className="bg-white p-2.5 rounded-xl border text-xs">
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-gray-500">Stock: {p.stock} {p.unit}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showOutOfStockList && settings.stockCheckEnabled && (
            <div className="bg-red-50 p-5 rounded-2xl border border-red-200 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-red-900 mb-2">🔴 Out of Stock Products</h3>
              {products.filter(p => p.stock <= 0).length === 0 ? <p className="text-xs text-gray-600">No out of stock items!</p> : (
                <div className="space-y-1">
                  {products.filter(p => p.stock <= 0).map(p => (
                    <p key={p.id} className="text-xs font-bold text-red-700">• {p.name} ({p.category})</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {showProductsList && (
            <div className="bg-white p-5 rounded-2xl border mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4A121F] mb-3">All Products Inventory Summary</h3>
              {products.length === 0 ? <p className="text-xs text-gray-500">No products found.</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {products.map(p => (
                    <div key={p.id} className="bg-gray-50 p-2.5 rounded-xl border text-xs">
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-gray-500">₹{p.price} | Stock: {p.stock}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showBillsList && (
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Invoices Ledger History</h3>
              {filteredInvoices.length === 0 ? (
                <p className="text-gray-400 text-xs py-6 text-center">No invoices found.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 uppercase">
                    <tr>
                      <th className="p-2.5">Bill #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5 text-right">Total / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInvoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-[#4A121F]">#{inv.billNumber} ({inv.id})</td>
                        <td className="p-2.5 text-gray-500">{inv.date}</td>
                        <td className="p-2.5 font-semibold">{inv.customer}</td>
                        <td className="p-2.5"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{inv.mode}</span></td>
                        <td className="p-2.5 text-right space-x-2">
                          <span className="font-extrabold">₹{inv.total.toFixed(2)}</span>
                          <button onClick={() => triggerPrintReceipt(inv)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer">Print 🖨️</button>
                          <button onClick={() => handleDeleteInvoice(inv.id)} className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer">Delete 🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS & PROFILE */}
      {activeTab === 'settings' && (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF7F2]">
          <h2 className="text-xl font-extrabold text-[#4A121F] mb-4">Shop Profile & POS Settings</h2>
          <div className="bg-white rounded-2xl border p-6 shadow-sm max-w-xl space-y-4 text-xs sm:text-sm">
            
            <h3 className="text-sm font-bold text-[#4A121F] border-b pb-2">Shop Profile & Login Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Shop Name</label>
                <input type="text" value={regData.shopName} onChange={(e) => setRegData({...regData, shopName: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Owner Name</label>
                <input type="text" value={regData.ownerName} onChange={(e) => setRegData({...regData, ownerName: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Login Username</label>
                <input type="text" value={regData.username} onChange={(e) => setRegData({...regData, username: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Login Password</label>
                <input type="password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Number</label>
                <input type="text" value={regData.contactNumber} onChange={(e) => setRegData({...regData, contactNumber: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Shop Email</label>
                <input type="email" value={regData.shopEmail} onChange={(e) => setRegData({...regData, shopEmail: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Shop Address</label>
              <input type="text" value={regData.address} onChange={(e) => setRegData({...regData, address: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">GSTIN Number</label>
              <input type="text" value={regData.gstin} onChange={(e) => setRegData({...regData, gstin: e.target.value})} className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium" />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Shop Description / Items Header</label>
              <textarea value={regData.description} onChange={(e) => setRegData({...regData, description: e.target.value})} rows="2" className="w-full border rounded-xl p-2.5 bg-gray-50 font-medium"></textarea>
            </div>

            <h3 className="text-sm font-bold text-[#4A121F] border-b pb-2 pt-2">Security & MPIN Update (For Sleep Mode)</h3>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Change 4-Digit MPIN</label>
              <input type="password" maxLength="4" placeholder="New 4-digit MPIN" value={newMpinInput} onChange={(e) => setNewMpinInput(e.target.value)} className="w-full border rounded-xl p-2.5 bg-gray-50 font-bold" />
            </div>

            <h3 className="text-sm font-bold text-[#4A121F] border-b pb-2 pt-2">System Rules & Default GST</h3>
            <div className="flex justify-between items-center">
              <span>Enable Stock Validation Check</span>
              <input type="checkbox" checked={settings.stockCheckEnabled} onChange={(e) => setSettings({...settings, stockCheckEnabled: e.target.checked})} className="w-5 h-5 accent-[#6B1D2F] cursor-pointer" />
            </div>
            
            <div className="flex justify-between items-center relative">
              <span>Default GST Rate (%)</span>
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setIsGstDropdownOpen(!isGstDropdownOpen)}
                  className="border rounded p-1.5 font-bold bg-gray-50 cursor-pointer flex items-center space-x-1 text-xs"
                >
                  <span>{settings.gstPercent}%</span>
                  <span>▼</span>
                </button>
                {isGstDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs font-medium">
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <button key={rate} type="button" onClick={() => { setSettings({...settings, gstPercent: rate}); setIsGstDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">{rate}%</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => {
              if (newMpinInput && newMpinInput.length === 4) {
                setMpin(newMpinInput);
                setNewMpinInput('');
                alert('Profile, Credentials & MPIN updated successfully!');
              } else if (newMpinInput && newMpinInput.length !== 4) {
                alert('MPIN must be exactly 4 digits!');
                return;
              } else {
                alert('Profile & Settings updated successfully!');
              }
            }} className="w-full bg-[#6B1D2F] text-white py-3.5 rounded-xl font-bold text-sm shadow cursor-pointer mt-4">Save Profile & Settings</button>
          </div>
        </div>
      )}

    </div>
  );
}